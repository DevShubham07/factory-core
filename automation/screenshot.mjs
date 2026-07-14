#!/usr/bin/env node
/**
 * screenshot.mjs
 *
 * ---------------------------------------------------------------------------
 * Inputs (flags):
 *   --url <url>   (required) page to screenshot (local dev URL, *.vercel.app
 *                 preview, or live production URL).
 *   --out <path>  (required) output PNG path. Parent directories are created
 *                 as needed.
 *   --width <n>   viewport width, default 1280.
 *   --height <n>  viewport height, default 800.
 *   --full-page   capture the full scrollable page, not just the viewport.
 *   --dry-run     print the plan (which Playwright source will be used, and
 *                 the resulting command/API call); take no screenshot, write
 *                 no file.
 *   --help        print this contract and exit 0.
 *
 * Outputs:
 *   - PNG file at --out.
 *
 * Exit codes:
 *   0  - screenshot written successfully.
 *   1  - missing required args, both the primary and fallback capture paths
 *        failed, or the navigation/screenshot itself errored.
 *
 * Idempotency: overwrites --out on every run by design (gate-evidence
 * screenshots are meant to be refreshed each time a gate is re-verified,
 * plan §9 "Screenshots for records ... on gate passes"). Not a stateful
 * script otherwise.
 *
 * Playwright source (two-tier, per task spec):
 *   1. PRIMARY: dynamic `import()` of the site-template's own installed
 *      @playwright/test, from
 *      C:\Users\gshub\OneDrive\Desktop\CompellingFuture\factory\site-template\node_modules\@playwright\test
 *      This avoids requiring a separate Playwright install for this script.
 *      ASSUMPTION: the plan explicitly allows this exact fallback path
 *      ("site-template's node_modules ... ASSUMPTION allowed") - it assumes
 *      site-template has been `pnpm install`-ed at least once and its
 *      Playwright browser binaries are present locally.
 *   2. FALLBACK: if that dynamic import throws (module missing, or the
 *      browser binary isn't installed), spawn
 *      `npx playwright screenshot <url> <out>` as a child process. This
 *      requires `npx`/`playwright` to be resolvable on PATH or via npm's
 *      package runner; if neither tier works, the script fails with a
 *      [fail] message naming both attempts.
 * ---------------------------------------------------------------------------
 */

import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const HELP = `screenshot.mjs - capture a PNG of a URL via Playwright

Usage:
  node screenshot.mjs --url <url> --out <path.png> [--width 1280] [--height 800] [--full-page] [--dry-run]

Tries site-template's installed @playwright/test first (dynamic import);
falls back to \`npx playwright screenshot\` if that's unavailable.
`;

const WORKSPACE_ROOT = "C:\\Users\\gshub\\OneDrive\\Desktop\\CompellingFuture\\factory";
// ASSUMPTION: exact path named in the task spec.
const TEMPLATE_PLAYWRIGHT_DIR = path.join(WORKSPACE_ROOT, "site-template", "node_modules", "@playwright", "test");

function parseArgs(argv) {
  const out = { url: null, out: null, width: 1280, height: 800, fullPage: false, dryRun: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--full-page") out.fullPage = true;
    else if (a === "--url") out.url = argv[++i];
    else if (a === "--out") out.out = argv[++i];
    else if (a === "--width") out.width = Number(argv[++i]);
    else if (a === "--height") out.height = Number(argv[++i]);
    else if (a.startsWith("--")) {
      console.error(`[fail] unknown flag: ${a}`);
      process.exit(1);
    }
  }
  return out;
}

async function captureViaTemplatePlaywright(args) {
  // Prefer the package's ESM entry (index.mjs, per its package.json "exports"
  // "import" condition) - importing the CJS entry (index.js) directly by
  // file:// URL bypasses Node's exports-map resolution and can produce an
  // incomplete/incorrect named-export interop (observed: chromium undefined).
  const mjsEntry = path.join(TEMPLATE_PLAYWRIGHT_DIR, "index.mjs");
  const cjsEntry = path.join(TEMPLATE_PLAYWRIGHT_DIR, "index.js");
  const entryPoint = existsSync(mjsEntry) ? mjsEntry : existsSync(cjsEntry) ? cjsEntry : TEMPLATE_PLAYWRIGHT_DIR;
  const mod = await import(pathToFileURL(entryPoint).href);
  const { chromium } = mod;
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: args.width, height: args.height } });
    await page.goto(args.url, { waitUntil: "load" });
    await page.screenshot({ path: args.out, fullPage: args.fullPage });
  } finally {
    await browser.close();
  }
}

function captureViaNpx(args) {
  const cmdArgs = ["playwright", "screenshot", "--viewport-size", `${args.width},${args.height}`];
  if (args.fullPage) cmdArgs.push("--full-page");
  cmdArgs.push(args.url, args.out);
  execFileSync("npx", cmdArgs, { stdio: "inherit", shell: true });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }

  if (!args.url || !args.out) {
    console.error("[fail] --url and --out are required");
    console.log(HELP);
    process.exit(1);
  }

  mkdirSync(path.dirname(path.resolve(args.out)), { recursive: true });

  if (args.dryRun) {
    console.log(`[ok] dry-run: primary source -> dynamic import from ${TEMPLATE_PLAYWRIGHT_DIR}`);
    console.log(`[ok] dry-run: fallback source -> npx playwright screenshot ${args.url} ${args.out}`);
    console.log(`[ok] dry-run: would write ${args.out} (${args.width}x${args.height}${args.fullPage ? ", full-page" : ""})`);
    process.exit(0);
  }

  let primaryError = null;
  try {
    console.log(`[ok] trying site-template's Playwright (${TEMPLATE_PLAYWRIGHT_DIR})`);
    await captureViaTemplatePlaywright(args);
    console.log(`[ok] screenshot written via site-template Playwright: ${args.out}`);
    process.exitCode = 0;
    return;
  } catch (err) {
    primaryError = err;
    console.log(`[warn] site-template Playwright path failed: ${err.message}`);
  }

  try {
    console.log("[ok] falling back to: npx playwright screenshot");
    captureViaNpx(args);
    console.log(`[ok] screenshot written via npx fallback: ${args.out}`);
    process.exitCode = 0;
  } catch (fallbackErr) {
    console.error(`[fail] both capture paths failed.`);
    console.error(`       primary:  ${primaryError.message}`);
    console.error(`       fallback: ${fallbackErr.message}`);
    process.exitCode = 1;
  }
}

main();
