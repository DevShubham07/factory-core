#!/usr/bin/env node
/**
 * new-site.mjs
 *
 * ---------------------------------------------------------------------------
 * Inputs (flags):
 *   --slug <slug>          (required) URL-safe id, e.g. "monitorsizecalculator".
 *   --domain <domain>      (required) bare domain, e.g. "monitorsizecalculator.com".
 *   --name <name>          (required) human-readable site/tool name.
 *   --keyword <keyword>    (required) main SEO keyword.
 *   --description <text>   (required) <=160 char meta description.
 *   --org <github-org>     GitHub org/user to substitute in .github/workflows/ci.yml
 *                          and renovate.json. Default: "DevShubham07" (the
 *                          template's real org — override only when scaffolding
 *                          under a different account/org).
 *   --source <path>        site-template directory to copy from. Default:
 *                          C:\Users\gshub\OneDrive\Desktop\CompellingFuture\factory\site-template
 *   --dest <path>           target directory. Default: sibling folder
 *                          "site-<slug>" next to --source's parent (i.e. the
 *                          factory workspace root).
 *   --portfolio <path>     override for factory-core/registry/portfolio.json
 *                          (used by fixture/dry runs so G0 doesn't mutate the
 *                          real fleet registry).
 *   --install              after scaffolding: run `pnpm install`, `git init`,
 *                          and a first commit in --dest.
 *   --force                allow overwriting an existing --dest.
 *   --dry-run              print every planned action; make no filesystem or
 *                          git/pnpm changes.
 *   --help                 print this contract and exit 0.
 *
 * Outputs:
 *   - A new site-<slug> directory (copy of site-template, excluding
 *     node_modules/dist/.astro/.git/test-results/playwright-report) with
 *     site.config.mjs, package.json, vercel.json, .github/workflows/ci.yml,
 *     renovate.json, and site.json rewritten for the new identity.
 *   - factory-core/registry/portfolio.json created (if absent) or updated
 *     with an entry for this slug (idempotent by slug).
 *
 * Exit codes:
 *   0  - scaffold (and optional install) completed successfully.
 *   1  - missing required args, dest already exists without --force, source
 *        template missing, or (with --install) pnpm/git failed.
 *
 * Idempotency (plan §3.4, check-before-create):
 *   - Refuses to overwrite an existing --dest unless --force is given.
 *   - The portfolio.json registration is idempotent by slug: re-running this
 *     script for the same slug updates the existing record in place rather
 *     than appending a duplicate.
 * ---------------------------------------------------------------------------
 */

import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const HELP = `new-site.mjs - scaffold a new site-<slug> from site-template

Usage:
  node new-site.mjs --slug <slug> --domain <domain> --name <name> \\
    --keyword <keyword> --description <text> \\
    [--org <github-org>] [--source <path>] [--dest <path>] \\
    [--portfolio <path>] [--install] [--force] [--dry-run]

Required: --slug --domain --name --keyword --description
Refuses to overwrite an existing --dest unless --force is passed.
--install runs pnpm install + git init + first commit after scaffolding.
`;

const EXCLUDES = new Set(["node_modules", "dist", ".astro", ".git", "test-results", "playwright-report"]);

const WORKSPACE_ROOT = "C:\\Users\\gshub\\OneDrive\\Desktop\\CompellingFuture\\factory";
const DEFAULT_SOURCE = path.join(WORKSPACE_ROOT, "site-template");
const DEFAULT_PORTFOLIO = path.join(WORKSPACE_ROOT, "factory-core", "registry", "portfolio.json");

function parseArgs(argv) {
  const out = {
    slug: null,
    domain: null,
    name: null,
    keyword: null,
    description: null,
    org: "DevShubham07",
    source: DEFAULT_SOURCE,
    dest: null,
    portfolio: DEFAULT_PORTFOLIO,
    install: false,
    force: false,
    dryRun: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--install") out.install = true;
    else if (a === "--force") out.force = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--slug") out.slug = argv[++i];
    else if (a === "--domain") out.domain = argv[++i];
    else if (a === "--name") out.name = argv[++i];
    else if (a === "--keyword") out.keyword = argv[++i];
    else if (a === "--description") out.description = argv[++i];
    else if (a === "--org") out.org = argv[++i];
    else if (a === "--source") out.source = argv[++i];
    else if (a === "--dest") out.dest = argv[++i];
    else if (a === "--portfolio") out.portfolio = argv[++i];
    else if (a.startsWith("--")) {
      console.error(`[fail] unknown flag: ${a}`);
      process.exit(1);
    }
  }
  return out;
}

function copyDir(src, dest, dryRun) {
  if (!existsSync(dest)) {
    if (!dryRun) mkdirSync(dest, { recursive: true });
  }
  for (const entry of readdirSync(src)) {
    if (EXCLUDES.has(entry)) continue;
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const st = statSync(s);
    if (st.isDirectory()) {
      copyDir(s, d, dryRun);
    } else {
      if (dryRun) console.log(`  copy ${s} -> ${d}`);
      else {
        mkdirSync(path.dirname(d), { recursive: true });
        copyFileSync(s, d);
      }
    }
  }
}

function rewriteSiteConfig(destDir, sourceDir, opts, dryRun) {
  const file = path.join(destDir, "site.config.mjs");
  const readFrom = dryRun ? path.join(sourceDir, "site.config.mjs") : file;
  let text = readFileSync(readFrom, "utf8");
  const replacements = {
    name: opts.name,
    domain: opts.domain,
    keyword: opts.keyword,
    description: opts.description,
    vercelSlug: `site-${opts.slug}`,
    legalName: opts.name,
  };
  for (const [key, value] of Object.entries(replacements)) {
    const escaped = String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const re = new RegExp(`(${key}:\\s*)"[^"]*"`);
    if (!re.test(text)) {
      console.log(`[warn] site.config.mjs: field "${key}" not found (pattern not matched) - left unchanged`);
      continue;
    }
    text = text.replace(re, `$1"${escaped}"`);
  }
  if (dryRun) console.log(`  rewrite ${file} (name/domain/keyword/description/vercelSlug/legalName)`);
  else writeFileSync(file, text, "utf8");
}

function rewritePackageJson(destDir, sourceDir, opts, dryRun) {
  const file = path.join(destDir, "package.json");
  const readFrom = dryRun ? path.join(sourceDir, "package.json") : file;
  const pkg = JSON.parse(readFileSync(readFrom, "utf8"));
  pkg.name = `site-${opts.slug}`;
  if (dryRun) console.log(`  rewrite ${file} (name -> site-${opts.slug})`);
  else writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n", "utf8");
  return pkg;
}

function rewriteVercelJson(destDir, sourceDir, opts, dryRun) {
  const file = path.join(destDir, "vercel.json");
  const readFrom = dryRun ? path.join(sourceDir, "vercel.json") : file;
  const conf = JSON.parse(readFileSync(readFrom, "utf8"));
  const target = `site-${opts.slug}.vercel.app`;
  let touched = false;
  for (const h of conf.headers || []) {
    for (const has of h.has || []) {
      if (has.type === "host") {
        has.value = target;
        touched = true;
      }
    }
  }
  if (!touched) console.log(`[warn] vercel.json: no host-type "has" entry found to rewrite`);
  if (dryRun) console.log(`  rewrite ${file} (host -> ${target})`);
  else writeFileSync(file, JSON.stringify(conf, null, 2) + "\n", "utf8");
}

function rewriteOrgPlaceholder(destDir, sourceDir, relPath, org, dryRun) {
  const file = path.join(destDir, relPath);
  const readFrom = dryRun ? path.join(sourceDir, relPath) : file;
  if (!existsSync(readFrom)) {
    console.log(`[warn] ${relPath} not found in template - skipped`);
    return;
  }
  let text = readFileSync(readFrom, "utf8");
  const before = text;
  text = text.split("DevShubham07").join(org);
  if (text === before && org !== "DevShubham07") {
    console.log(`[warn] ${relPath}: no DevShubham07 occurrences found`);
  }
  if (dryRun) console.log(`  rewrite ${file} (org -> ${org})`);
  else writeFileSync(file, text, "utf8");
}

function resolveTemplateTag(sourceDir, pkg) {
  try {
    const tag = execFileSync("git", ["-C", sourceDir, "describe", "--tags", "--always"], {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    if (tag) return tag;
  } catch {
    // not a git repo, or no tags - fall through to package version
  }
  const version = pkg && pkg.version ? pkg.version : "0.0.0";
  return `template-v${version}`;
}

function rewriteSiteJson(destDir, sourceDir, opts, templateTag, dryRun) {
  const file = path.join(destDir, "site.json");
  const readFrom = dryRun ? path.join(sourceDir, "site.json") : file;
  const site = JSON.parse(readFileSync(readFrom, "utf8"));
  site.slug = opts.slug;
  site.domain = opts.domain;
  site.state = "IDEA"; // scaffolding alone does not pass any gate
  site.template_tag = templateTag;
  if (dryRun) console.log(`  rewrite ${file} (slug/domain/template_tag; state stays IDEA)`);
  else writeFileSync(file, JSON.stringify(site, null, 2) + "\n", "utf8");
  return site;
}

function readPortfolio(portfolioPath) {
  if (!existsSync(portfolioPath)) return [];
  const text = readFileSync(portfolioPath, "utf8").trim();
  if (!text) return [];
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : parsed.sites || [];
}

function upsertPortfolio(portfolioPath, opts, templateTag, dryRun) {
  const list = readPortfolio(portfolioPath);
  const now = new Date().toISOString();
  const idx = list.findIndex((r) => r.slug === opts.slug);
  if (idx === -1) {
    list.push({
      slug: opts.slug,
      domain: opts.domain,
      name: opts.name,
      keyword: opts.keyword,
      state: "IDEA",
      template_tag: templateTag,
      scores: null,
      created_at: now,
      updated_at: now,
      last_gate: null,
      urls: { vercel: null, production: null },
      external: {
        vercel_project: null,
        gsc_property: null,
        sentry_dsn: null,
        adsense_pub: null,
        indexnow_key: null,
        indexnow_key_file: null,
      },
    });
    console.log(`[ok] portfolio: added new entry for slug "${opts.slug}"`);
  } else {
    const rec = list[idx];
    rec.domain = opts.domain;
    rec.name = opts.name;
    rec.keyword = opts.keyword;
    rec.template_tag = templateTag;
    rec.updated_at = now;
    console.log(`[ok] portfolio: updated existing entry for slug "${opts.slug}" (idempotent)`);
  }
  if (dryRun) {
    console.log(`  write ${portfolioPath} (${list.length} entries)`);
    return;
  }
  mkdirSync(path.dirname(portfolioPath), { recursive: true });
  writeFileSync(portfolioPath, JSON.stringify(list, null, 2) + "\n", "utf8");
}

function runInstall(destDir) {
  console.log(`[ok] --install: running pnpm install in ${destDir}`);
  execFileSync("pnpm", ["install"], { cwd: destDir, stdio: "inherit", shell: true });

  if (!existsSync(path.join(destDir, ".git"))) {
    console.log(`[ok] --install: git init`);
    execFileSync("git", ["init"], { cwd: destDir, stdio: "inherit" });
  }
  console.log(`[ok] --install: git add + first commit`);
  execFileSync("git", ["add", "-A"], { cwd: destDir, stdio: "inherit" });
  execFileSync("git", ["commit", "-m", "chore: scaffold from site-template"], {
    cwd: destDir,
    stdio: "inherit",
  });
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(HELP);
    process.exit(0);
  }

  const missing = ["slug", "domain", "name", "keyword", "description"].filter((k) => !opts[k]);
  if (missing.length) {
    console.error(`[fail] missing required flag(s): ${missing.map((m) => "--" + m).join(", ")}`);
    console.log(HELP);
    process.exit(1);
  }

  if (!/^[a-z0-9-]+$/.test(opts.slug)) {
    console.error(`[fail] --slug must match ^[a-z0-9-]+$, got "${opts.slug}"`);
    process.exit(1);
  }

  if (!opts.dest) {
    const workspaceRoot = path.dirname(path.resolve(opts.source));
    opts.dest = path.join(workspaceRoot, `site-${opts.slug}`);
  }

  if (!existsSync(opts.source)) {
    console.error(`[fail] --source template not found: ${opts.source}`);
    process.exit(1);
  }

  if (existsSync(opts.dest) && !opts.force) {
    console.error(`[fail] --dest already exists: ${opts.dest} (use --force to overwrite)`);
    process.exit(1);
  }

  console.log(`[ok] scaffolding site-${opts.slug}`);
  console.log(`     source: ${opts.source}`);
  console.log(`     dest:   ${opts.dest}`);

  copyDir(opts.source, opts.dest, opts.dryRun);
  rewriteSiteConfig(opts.dest, opts.source, opts, opts.dryRun);
  const pkg = rewritePackageJson(opts.dest, opts.source, opts, opts.dryRun);
  rewriteVercelJson(opts.dest, opts.source, opts, opts.dryRun);
  rewriteOrgPlaceholder(opts.dest, opts.source, path.join(".github", "workflows", "ci.yml"), opts.org, opts.dryRun);
  rewriteOrgPlaceholder(opts.dest, opts.source, "renovate.json", opts.org, opts.dryRun);

  const templateTag = resolveTemplateTag(opts.source, pkg);
  rewriteSiteJson(opts.dest, opts.source, opts, templateTag, opts.dryRun);
  upsertPortfolio(opts.portfolio, opts, templateTag, opts.dryRun);

  if (opts.install) {
    if (opts.dryRun) {
      console.log(`  would run: pnpm install / git init / git commit in ${opts.dest}`);
    } else {
      try {
        runInstall(opts.dest);
      } catch (err) {
        console.error(`[fail] --install step failed: ${err.message}`);
        process.exit(1);
      }
    }
  }

  console.log(`[ok] site-${opts.slug} scaffold complete${opts.dryRun ? " (dry-run, no changes written)" : ""}`);
  process.exit(0);
}

main();
