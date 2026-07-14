#!/usr/bin/env node
/**
 * indexnow.mjs
 *
 * ---------------------------------------------------------------------------
 * Inputs (flags):
 *   --domain <domain>       (required) bare host, e.g. "monitorsizecalculator.com".
 *   --urls <a,b,c>          comma-separated absolute URL list. Mutually
 *                           combinable with --file (both are merged).
 *   --file <path>           text file, one URL per line (# comments allowed).
 *   --key <hex32>           reuse an existing 32-char hex IndexNow key
 *                           instead of generating one.
 *   --key-file-out <path>   where to write the key verification file
 *                           (`<key>.txt`, containing just the key). Default:
 *                           ./<key>.txt in the current working directory -
 *                           the operator must copy it to the site's
 *                           `public/` folder so it's served at
 *                           https://<domain>/<key>.txt before (or as part
 *                           of) the same deploy, per IndexNow protocol.
 *   --portfolio <path>      override for factory-core/registry/portfolio.json
 *                           (idempotency: reuses a previously recorded key
 *                           for this domain instead of generating a new one).
 *   --dry-run               print the exact JSON payload that would be
 *                           POSTed; make no HTTP request and do not write
 *                           files or the portfolio.
 *   --help                  print this contract and exit 0.
 *
 * Outputs:
 *   - <key>.txt written at --key-file-out (unless --dry-run).
 *   - POST https://api.indexnow.org/indexnow (unless --dry-run), body:
 *     {host, key, keyLocation, urlList[]}.
 *   - factory-core/registry/portfolio.json entry for --domain updated with
 *     external.indexnow_key / external.indexnow_key_file (idempotent by
 *     domain; unless --dry-run).
 *
 * Exit codes:
 *   0  - payload built (and, unless --dry-run, POSTed with a 200/202
 *        response) successfully.
 *   1  - missing required args, no URLs supplied, more than 10000 URLs
 *        (protocol cap, Appendix B / §14.2), or the POST did not return
 *        200/202.
 *
 * Idempotency (plan §3.4): if a key is already recorded in portfolio.json
 * for --domain, it is reused rather than a fresh one being generated (so
 * re-running this script never invalidates a key already deployed at
 * https://<domain>/<key>.txt). Submitting the same URL list twice is a
 * harmless no-op per the IndexNow protocol.
 * ---------------------------------------------------------------------------
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

const HELP = `indexnow.mjs - submit URLs to IndexNow (Bing/Yandex/Seznam/Naver; NOT Google)

Usage:
  node indexnow.mjs --domain <domain> --urls <url1,url2,...> [--file urls.txt] \\
    [--key <hex32>] [--key-file-out <path>] [--portfolio <path>] [--dry-run]

Required: --domain, and at least one of --urls / --file
Cap: 10000 URLs per call (protocol limit).
Google does not support IndexNow - its indexing path is sitemaps only (D-08).
`;

const WORKSPACE_ROOT = "C:\\Users\\gshub\\OneDrive\\Desktop\\CompellingFuture\\factory";
const DEFAULT_PORTFOLIO = path.join(WORKSPACE_ROOT, "factory-core", "registry", "portfolio.json");
const MAX_URLS = 10000;

function parseArgs(argv) {
  const out = {
    domain: null,
    urls: null,
    file: null,
    key: null,
    keyFileOut: null,
    portfolio: DEFAULT_PORTFOLIO,
    dryRun: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--domain") out.domain = argv[++i];
    else if (a === "--urls") out.urls = argv[++i];
    else if (a === "--file") out.file = argv[++i];
    else if (a === "--key") out.key = argv[++i];
    else if (a === "--key-file-out") out.keyFileOut = argv[++i];
    else if (a === "--portfolio") out.portfolio = argv[++i];
    else if (a.startsWith("--")) {
      console.error(`[fail] unknown flag: ${a}`);
      process.exit(1);
    }
  }
  return out;
}

function readPortfolio(portfolioPath) {
  if (!existsSync(portfolioPath)) return [];
  const text = readFileSync(portfolioPath, "utf8").trim();
  if (!text) return [];
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : parsed.sites || [];
}

function generateKey() {
  return randomBytes(16).toString("hex"); // 32 hex chars
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }

  if (!args.domain) {
    console.error("[fail] --domain is required");
    console.log(HELP);
    process.exit(1);
  }

  let urlList = [];
  if (args.urls) urlList = urlList.concat(args.urls.split(",").map((u) => u.trim()).filter(Boolean));
  if (args.file) {
    const text = readFileSync(args.file, "utf8");
    urlList = urlList.concat(
      text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"))
    );
  }
  urlList = [...new Set(urlList)];

  if (urlList.length === 0) {
    console.error("[fail] no URLs supplied (--urls and/or --file)");
    process.exit(1);
  }
  if (urlList.length > MAX_URLS) {
    console.error(`[fail] ${urlList.length} URLs exceeds the IndexNow cap of ${MAX_URLS} per call - split the batch`);
    process.exit(1);
  }

  const portfolio = readPortfolio(args.portfolio);
  const existingRecord = portfolio.find((r) => r.domain === args.domain);
  const existingKey = existingRecord && existingRecord.external && existingRecord.external.indexnow_key;

  let key = args.key || existingKey || generateKey();
  if (args.key) console.log(`[ok] using supplied --key`);
  else if (existingKey) console.log(`[ok] reusing key already recorded in portfolio.json for ${args.domain} (idempotent)`);
  else console.log(`[ok] generated new 32-hex IndexNow key`);

  const keyFileOut = args.keyFileOut || path.join(process.cwd(), `${key}.txt`);
  const keyLocation = `https://${args.domain}/${key}.txt`;

  const payload = {
    host: args.domain,
    key,
    keyLocation,
    urlList,
  };

  console.log(`[ok] key file location (deploy this key text to this exact URL): ${keyLocation}`);
  console.log(`[ok] ${urlList.length} URL(s) to submit`);

  if (args.dryRun) {
    console.log("[ok] dry-run payload:");
    console.log(JSON.stringify(payload, null, 2));
    console.log(`[ok] dry-run: would write key file to ${keyFileOut}`);
    process.exit(0);
  }

  mkdirSync(path.dirname(keyFileOut), { recursive: true });
  writeFileSync(keyFileOut, key, "utf8");
  console.log(`[ok] wrote key file: ${keyFileOut}`);
  console.log(`[HUMAN] deploy/copy this file so it is served at ${keyLocation} before relying on the submission`);

  postAndRecord(payload, args).catch((err) => {
    console.error(`[fail] indexnow submission errored: ${err.message}`);
    process.exitCode = 1;
  });
}

async function postAndRecord(payload, args) {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  if (res.status !== 200 && res.status !== 202) {
    const body = await res.text().catch(() => "");
    console.error(`[fail] IndexNow POST returned HTTP ${res.status}: ${body}`);
    process.exitCode = 1;
    return;
  }
  console.log(`[ok] IndexNow POST accepted (HTTP ${res.status})`);

  const portfolio = readPortfolio(args.portfolio);
  const now = new Date().toISOString();
  const idx = portfolio.findIndex((r) => r.domain === args.domain);
  if (idx === -1) {
    console.log(`[warn] no portfolio.json entry for domain ${args.domain} yet - key not recorded (run new-site.mjs first)`);
  } else {
    portfolio[idx].external = portfolio[idx].external || {};
    portfolio[idx].external.indexnow_key = payload.key;
    portfolio[idx].external.indexnow_key_file = payload.keyLocation;
    portfolio[idx].updated_at = now;
    mkdirSync(path.dirname(args.portfolio), { recursive: true });
    writeFileSync(args.portfolio, JSON.stringify(portfolio, null, 2) + "\n", "utf8");
    console.log(`[ok] recorded key in portfolio.json for ${args.domain}`);
  }
  process.exitCode = 0;
}

main();
