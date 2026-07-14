#!/usr/bin/env node
/**
 * fleet-status.mjs
 *
 * ---------------------------------------------------------------------------
 * Inputs (flags):
 *   (none required) - reads factory-core/registry/portfolio.json.
 *   --portfolio <path>  override the registry path (DEVIATION from the task
 *                       spec's "no args": added so G0 and this repo's own
 *                       tests can exercise the script against
 *                       fixtures/portfolio.fixture.json without touching the
 *                       real fleet registry. Omit it for normal use.)
 *   --stale-days <n>    override the staleness window (default 14, per plan
 *                       §11: "in a non-terminal state >14 days").
 *   --help              print this contract and exit 0.
 *
 * Outputs:
 *   - Console: a pretty-printed table (slug, domain, state, last gate, live
 *     URL) plus a "STALE" flag column for sites in a non-terminal state
 *     whose last gate (or, if no gate yet, last portfolio update) is older
 *     than --stale-days.
 *   - No files are written.
 *
 * Exit codes:
 *   0  - always, when the table was printed successfully (this is a
 *        reporting tool; "stale sites exist" is not itself a failure).
 *   1  - portfolio.json missing/unparseable.
 *
 * Idempotency: read-only. Safe to re-run any number of times.
 *
 * Terminal states (plan §3.2): only PARKED and KILLED are terminal; every
 * other state is eligible for the staleness check.
 * ---------------------------------------------------------------------------
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const HELP = `fleet-status.mjs - pretty-print the fleet registry (portfolio.json)

Usage:
  node fleet-status.mjs [--portfolio <path>] [--stale-days 14]

Flags stale sites: non-terminal state (not PARKED/KILLED) with no gate
progress in more than --stale-days days.
`;

const WORKSPACE_ROOT = "C:\\Users\\gshub\\OneDrive\\Desktop\\CompellingFuture\\factory";
const DEFAULT_PORTFOLIO = path.join(WORKSPACE_ROOT, "factory-core", "registry", "portfolio.json");
const TERMINAL_STATES = new Set(["PARKED", "KILLED"]);
const DEFAULT_STALE_DAYS = 14;

function parseArgs(argv) {
  const out = { portfolio: DEFAULT_PORTFOLIO, staleDays: DEFAULT_STALE_DAYS, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--portfolio") out.portfolio = argv[++i];
    else if (a === "--stale-days") out.staleDays = Number(argv[++i]);
    else if (a.startsWith("--")) {
      console.error(`[fail] unknown flag: ${a}`);
      process.exit(1);
    }
  }
  return out;
}

function readPortfolio(portfolioPath) {
  const text = readFileSync(portfolioPath, "utf8").trim();
  if (!text) return [];
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : parsed.sites || [];
}

function lastGateLabel(record) {
  if (record.last_gate && record.last_gate.gate) {
    return `${record.last_gate.gate} @ ${record.last_gate.timestamp}`;
  }
  if (Array.isArray(record.gates) && record.gates.length) {
    const last = record.gates[record.gates.length - 1];
    return `${last.gate} @ ${last.passed_at}`;
  }
  return "none";
}

function lastGateTimestamp(record) {
  if (record.last_gate && record.last_gate.timestamp) return record.last_gate.timestamp;
  if (Array.isArray(record.gates) && record.gates.length) {
    return record.gates[record.gates.length - 1].passed_at;
  }
  return record.updated_at || record.created_at || null;
}

function liveUrl(record) {
  if (record.urls && record.urls.production) return record.urls.production;
  if (record.urls && record.urls.vercel) return record.urls.vercel;
  return "-";
}

function isStale(record, staleDays) {
  if (TERMINAL_STATES.has(record.state)) return false;
  const ts = lastGateTimestamp(record);
  if (!ts) return true; // no progress recorded at all - treat as stale
  const ageMs = Date.now() - new Date(ts).getTime();
  return ageMs > staleDays * 24 * 60 * 60 * 1000;
}

function pad(str, len) {
  str = String(str);
  return str.length >= len ? str.slice(0, len - 1) + " " : str.padEnd(len);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }

  if (!existsSync(args.portfolio)) {
    console.error(`[fail] portfolio not found: ${args.portfolio}`);
    process.exit(1);
  }

  let records;
  try {
    records = readPortfolio(args.portfolio);
  } catch (err) {
    console.error(`[fail] could not parse portfolio: ${err.message}`);
    process.exit(1);
  }

  if (records.length === 0) {
    console.log("[ok] portfolio is empty - nothing to report");
    process.exit(0);
  }

  console.log(
    pad("SLUG", 26) + pad("DOMAIN", 30) + pad("STATE", 14) + pad("LAST GATE", 28) + pad("LIVE URL", 42) + "STALE"
  );
  console.log("-".repeat(150));

  let staleCount = 0;
  for (const r of records) {
    const stale = isStale(r, args.staleDays);
    if (stale) staleCount++;
    console.log(
      pad(r.slug || "-", 26) +
        pad(r.domain || "-", 30) +
        pad(r.state || "-", 14) +
        pad(lastGateLabel(r), 28) +
        pad(liveUrl(r), 42) +
        (stale ? `[warn] STALE (>${args.staleDays}d)` : "")
    );
  }

  console.log("-".repeat(150));
  console.log(`[ok] ${records.length} site(s), ${staleCount} stale (non-terminal, no gate progress in >${args.staleDays} days)`);
  process.exit(0);
}

main();
