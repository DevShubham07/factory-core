#!/usr/bin/env node
/**
 * rdap-check.mjs
 *
 * ---------------------------------------------------------------------------
 * Inputs:
 *   - Positional args: one or more domain names, e.g. `example.com`.
 *   - --file <path>   : text file, one domain per line (blank lines and lines
 *                       starting with '#' are ignored). Combined with any
 *                       positional domains.
 *   - --delay <ms>    : override the inter-request throttle (default 1000ms
 *                       = 1 req/sec, per plan §14.2 "RDAP: no published
 *                       quota; script throttles to 1 rps as courtesy").
 *   - --dry-run       : list the domains that would be checked and the RDAP
 *                       URL that would be queried, without making any HTTP
 *                       requests. (rdap-check has no side effects even when
 *                       "wet" - this flag exists for parity with the other
 *                       scripts and for offline testing.)
 *   - --fixture       : ignore all other domain args and run against
 *                       fixtures/rdap.fixture.txt (a known-TAKEN domain,
 *                       google.com) - the plan explicitly allows this script
 *                       to hit the real RDAP endpoint for its G0 fixture run.
 *   - --help          : print this contract and exit 0.
 *
 * Outputs:
 *   - Console: one line per domain as it's checked ([ok]/[warn]/[fail]
 *     prefixed), then a summary table.
 *   - No files are written.
 *
 * Scope (binding, per task spec): this script ONLY understands .com and .net
 * domains, both served by the Verisign RDAP endpoint. Any other TLD is
 * printed as [warn] SKIPPED (unsupported) and does not count as an error.
 *
 * Exit codes:
 *   0  - every supported-TLD domain was queried successfully (regardless of
 *        whether the result was AVAILABLE, TAKEN, or UNKNOWN-status).
 *   1  - at least one lookup threw (network failure, timeout, bad JSON) or
 *        no domains were supplied.
 *
 * Idempotency: read-only script. Safe to re-run any number of times; makes
 * no local or remote state changes.
 * ---------------------------------------------------------------------------
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HELP = `rdap-check.mjs - domain availability via RDAP (.com/.net only)

Usage:
  node rdap-check.mjs <domain.com> [<domain2.com> ...] [--file list.txt] [--delay 1000] [--dry-run]
  node rdap-check.mjs --fixture

Options:
  --file <path>   Text file, one domain per line (# comments allowed).
  --delay <ms>    Throttle between requests (default 1000ms / 1 req/sec).
  --dry-run       Print the domains/URLs that would be checked; no HTTP calls.
  --fixture       Run against fixtures/rdap.fixture.txt (google.com, real RDAP call).
  --help          Show this message.

Scope: only .com and .net domains are supported (Verisign RDAP registry).
Exit 0 if all supported-TLD lookups completed (any status). Exit 1 on any
network/lookup error, or if no domains were given.
`;

function parseArgs(argv) {
  const out = { _: [], file: null, delay: 1000, dryRun: false, fixture: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--fixture") out.fixture = true;
    else if (a === "--file") out.file = argv[++i];
    else if (a === "--delay") out.delay = Number(argv[++i]);
    else if (a.startsWith("--")) {
      console.error(`[fail] unknown flag: ${a}`);
      process.exit(1);
    } else out._.push(a);
  }
  return out;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function tldOf(domain) {
  const parts = domain.toLowerCase().split(".");
  return parts[parts.length - 1];
}

// ASSUMPTION: the plan only cites the .com endpoint
// (https://rdap.verisign.com/com/v1/domain/{name}). Verisign also operates
// the .net registry under the same RDAP service pattern, so we mirror the
// path for .net. If this assumption is wrong, .net lookups will surface as
// UNKNOWN (non-200/404 status) rather than silently mis-reporting.
function rdapUrlFor(domain) {
  const tld = tldOf(domain);
  return `https://rdap.verisign.com/${tld}/v1/domain/${domain}`;
}

function extractExpiry(body) {
  if (!body || !Array.isArray(body.events)) return null;
  const ev = body.events.find(
    (e) => e && typeof e.eventAction === "string" && e.eventAction.toLowerCase().includes("expir")
  );
  return ev ? ev.eventDate : null;
}

async function checkDomain(domain, delayMs) {
  const tld = tldOf(domain);
  if (tld !== "com" && tld !== "net") {
    console.log(`[warn] ${domain} - SKIPPED (unsupported TLD; only .com/.net are supported)`);
    return { domain, status: "SKIPPED", detail: "unsupported TLD", errored: false };
  }

  const url = rdapUrlFor(domain);
  try {
    const res = await fetch(url, { headers: { accept: "application/rdap+json" } });
    if (res.status === 404) {
      console.log(`[ok] ${domain} - AVAILABLE (probably) [RDAP 404]`);
      return { domain, status: "AVAILABLE(probably)", detail: "RDAP 404", errored: false };
    }
    if (res.status === 200) {
      let body = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }
      const expiry = extractExpiry(body);
      const detail = expiry ? `expires ${expiry}` : "no expiry event in RDAP body";
      console.log(`[ok] ${domain} - TAKEN [RDAP 200, ${detail}]`);
      return { domain, status: "TAKEN", detail, errored: false };
    }
    console.log(`[warn] ${domain} - UNKNOWN [RDAP HTTP ${res.status}]`);
    return { domain, status: "UNKNOWN", detail: `HTTP ${res.status}`, errored: false };
  } catch (err) {
    console.log(`[fail] ${domain} - lookup errored: ${err.message}`);
    return { domain, status: "ERROR", detail: err.message, errored: true };
  } finally {
    await sleep(delayMs);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }

  let domains = [...args._];

  if (args.fixture) {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const fixturePath = path.join(here, "fixtures", "rdap.fixture.txt");
    const text = readFileSync(fixturePath, "utf8");
    domains = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
    console.log(`[ok] loaded ${domains.length} domain(s) from fixture ${fixturePath}`);
  } else if (args.file) {
    const text = readFileSync(args.file, "utf8");
    const fromFile = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
    domains = domains.concat(fromFile);
  }

  if (domains.length === 0) {
    console.error("[fail] no domains supplied (positional args, --file, or --fixture)");
    console.log(HELP);
    process.exit(1);
  }

  if (args.dryRun) {
    console.log(`[ok] dry-run: would check ${domains.length} domain(s) at ${args.delay}ms throttle:`);
    for (const d of domains) {
      const tld = tldOf(d);
      if (tld !== "com" && tld !== "net") {
        console.log(`  - ${d} -> SKIPPED (unsupported TLD)`);
      } else {
        console.log(`  - ${d} -> ${rdapUrlFor(d)}`);
      }
    }
    process.exit(0);
  }

  const results = [];
  let hadError = false;
  for (const domain of domains) {
    const r = await checkDomain(domain, args.delay);
    results.push(r);
    if (r.errored) hadError = true;
  }

  console.log("\n--- Summary ---");
  console.log("Domain".padEnd(35) + "Status".padEnd(22) + "Detail");
  for (const r of results) {
    console.log(r.domain.padEnd(35) + r.status.padEnd(22) + r.detail);
  }

  if (hadError) {
    console.error("\n[fail] one or more lookups errored");
    process.exitCode = 1;
    return;
  }
  console.log("\n[ok] all lookups completed");
  process.exitCode = 0;
}

main();
