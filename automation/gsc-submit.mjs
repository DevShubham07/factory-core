#!/usr/bin/env node
/**
 * gsc-submit.mjs
 *
 * ---------------------------------------------------------------------------
 * Inputs (flags):
 *   --site-url <str>   (required) GSC property identifier: either
 *                       "sc-domain:example.com" (domain property) or a
 *                       URL-prefix property like "https://example.com/".
 *   --sitemap <url>    (required) absolute sitemap URL to submit, e.g.
 *                       "https://example.com/sitemap-index.xml".
 *   --inspect <url>    optional: also run URL Inspection on this URL.
 *   --sa <path>        path to a GCP service-account JSON key with Search
 *                       Console API access (plan §4.7). Default:
 *                       %USERPROFILE%\.factory\gsc-sa.json
 *   --dry-run          build the request plan (JWT claims, endpoints) and
 *                       print it; make no network calls (no token exchange,
 *                       no PUT, no inspect). Safe to run against the
 *                       fixtures/sa.fixture.json shape for G0.
 *   --help             print this contract and exit 0.
 *
 * Outputs:
 *   - stdout: [ok]/[warn]/[fail] progress lines, and (--dry-run) the planned
 *     JWT claim set + HTTP calls.
 *   - Real run: PUT to
 *     https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/sitemaps/{feedpath}
 *     submits the sitemap; optional POST to
 *     https://searchconsole.googleapis.com/v1/urlInspection/index:inspect.
 *
 * Exit codes:
 *   0  - sitemap submitted (HTTP 2xx from the Sitemaps API PUT), and
 *        --inspect (if given) completed.
 *   1  - SA file missing/unreadable ([HUMAN] setup message printed), token
 *        exchange failed, or the sitemap PUT did not return 2xx.
 *
 * Idempotency: the Sitemaps API PUT is idempotent by design (re-submitting
 * the same sitemap URL is a no-op on Google's side, it does not create
 * duplicates or error). This script does not maintain any local state beyond
 * printing results; nothing here needs "check before create".
 *
 * Auth flow (plan §4.7, §8 P8, Appendix C): OAuth2 JWT bearer grant per
 * Google's server-to-server flow -
 *   1. Build a JWT: header {alg:"RS256",typ:"JWT"}, claims {iss, scope,
 *      aud:"https://oauth2.googleapis.com/token", exp, iat}.
 *   2. Sign with the service account's RSA private key (node:crypto,
 *      RS256 = RSA-SHA256) -> base64url header.claims.signature.
 *   3. POST that JWT to https://oauth2.googleapis.com/token with
 *      grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer to get an
 *      access_token.
 *   4. Use "Authorization: Bearer <access_token>" on the Search Console API
 *      calls. Scope: https://www.googleapis.com/auth/webmasters.
 * ---------------------------------------------------------------------------
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { createSign } from "node:crypto";

const HELP = `gsc-submit.mjs - submit a sitemap (and optionally inspect a URL) via the Search Console API

Usage:
  node gsc-submit.mjs --site-url <sc-domain:example.com | https://example.com/> \\
    --sitemap <https://example.com/sitemap-index.xml> \\
    [--inspect <url>] [--sa <path-to-service-account.json>] [--dry-run]

Default --sa: %USERPROFILE%\\.factory\\gsc-sa.json
Requires: GCP project with Search Console API enabled, a service account
key, and that service account's email added as a GSC user on the property
(plan §4.7 - [HUMAN] one-time setup).
`;

const DEFAULT_SA = path.join(os.homedir(), ".factory", "gsc-sa.json");
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/webmasters";

function parseArgs(argv) {
  const out = { siteUrl: null, sitemap: null, inspect: null, sa: DEFAULT_SA, dryRun: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--site-url") out.siteUrl = argv[++i];
    else if (a === "--sitemap") out.sitemap = argv[++i];
    else if (a === "--inspect") out.inspect = argv[++i];
    else if (a === "--sa") out.sa = argv[++i];
    else if (a.startsWith("--")) {
      console.error(`[fail] unknown flag: ${a}`);
      process.exit(1);
    }
  }
  return out;
}

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildJwt(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: sa.client_email,
    scope: SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  return { header, claims, signingInput };
}

function signJwt(signingInput, privateKeyPem) {
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = signer
    .sign(privateKeyPem)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${signingInput}.${signature}`;
}

async function exchangeToken(jwt) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) {
    throw new Error(`token exchange failed (HTTP ${res.status}): ${JSON.stringify(body)}`);
  }
  return body.access_token;
}

async function submitSitemap(accessToken, siteUrl, sitemapUrl) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(
    sitemapUrl
  )}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`sitemap PUT failed (HTTP ${res.status}): ${text}`);
  }
  return res.status;
}

async function inspectUrl(accessToken, siteUrl, inspectionUrl) {
  const res = await fetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inspectionUrl, siteUrl }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`URL Inspection failed (HTTP ${res.status}): ${JSON.stringify(body)}`);
  }
  return body;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }

  if (!args.siteUrl || !args.sitemap) {
    console.error("[fail] --site-url and --sitemap are required");
    console.log(HELP);
    process.exit(1);
  }

  if (!existsSync(args.sa)) {
    console.error(`[fail] service-account file not found: ${args.sa}`);
    console.error(
      `[HUMAN] setup required: create a GCP project -> enable the Search Console API -> ` +
        `create a service account + JSON key -> save it to ${DEFAULT_SA} (or pass --sa) -> ` +
        `add the service account's client_email as a user on the GSC property (plan §4.7).`
    );
    process.exit(1);
  }

  let sa;
  try {
    sa = JSON.parse(readFileSync(args.sa, "utf8"));
  } catch (err) {
    console.error(`[fail] could not parse service-account JSON at ${args.sa}: ${err.message}`);
    process.exit(1);
  }

  if (!sa.client_email || !sa.private_key) {
    console.error(`[fail] ${args.sa} is missing client_email/private_key fields - not a valid service-account key`);
    process.exit(1);
  }

  const { claims, signingInput } = buildJwt(sa);
  const feedUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    args.siteUrl
  )}/sitemaps/${encodeURIComponent(args.sitemap)}`;

  console.log(`[ok] site: ${args.siteUrl}`);
  console.log(`[ok] sitemap: ${args.sitemap}`);
  console.log(`[ok] sitemaps API endpoint: PUT ${feedUrl}`);
  if (args.inspect) console.log(`[ok] will also inspect: ${args.inspect}`);

  if (args.dryRun) {
    console.log("[ok] dry-run: JWT claims that would be signed & exchanged:");
    console.log(JSON.stringify(claims, null, 2));
    console.log(`[ok] dry-run: token endpoint: POST ${TOKEN_URL}`);
    console.log("[ok] dry-run: no network calls made, no sitemap submitted");
    process.exit(0);
  }

  try {
    const jwt = signJwt(signingInput, sa.private_key);
    console.log("[ok] JWT signed (RS256)");
    const accessToken = await exchangeToken(jwt);
    console.log("[ok] access token acquired");
    const status = await submitSitemap(accessToken, args.siteUrl, args.sitemap);
    console.log(`[ok] sitemap submitted (HTTP ${status})`);

    if (args.inspect) {
      const result = await inspectUrl(accessToken, args.siteUrl, args.inspect);
      console.log("[ok] URL Inspection result:");
      console.log(JSON.stringify(result, null, 2));
    }
    process.exitCode = 0;
  } catch (err) {
    console.error(`[fail] ${err.message}`);
    process.exitCode = 1;
  }
}

main();
