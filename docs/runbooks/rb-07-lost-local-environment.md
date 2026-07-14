# RB-07 - Lost local environment

## Trigger
The operator's machine is lost, wiped, or replaced; a new machine needs to
resume factory operations with zero prior local state.

## Steps
1. Confirm everything needed is actually recoverable from git + dashboards
   (this is the design premise — nothing load-bearing should live only on
   the lost machine): `factory-core`, `site-template`, `ci-templates`,
   `renovate-config`, and every `site-<slug>` repo are all in GitHub;
   registry/state (`portfolio.json`, per-site `site.json`) are committed,
   not local-only.
2. Re-clone the repos needed for the immediate task (`factory-core` at
   minimum; specific `site-<slug>` repos as needed).
3. Restore local-only secrets from the [HUMAN] password manager (never
   from memory, never re-typed by AI): `.env` files, GSC service-account
   JSON (`%USERPROFILE%\.factory\gsc-sa.json`), `VERCEL_TOKEN`.
4. Re-authenticate CLIs and MCP connections:
   - `gh auth login`
   - `vercel login`
   - `/mcp` (re-authorize astro-docs, vercel, github, sentry, playwright
     per §6.4's `claude mcp add` commands)
5. Re-run `corepack enable` (pnpm) and confirm Node 22 LTS is active
   (`.nvmrc` in each repo).
6. Spot-check state resumability: open one `site.json` + `spec.md` and
   confirm a new Claude Code session can correctly resume from the recorded
   state per the §3.2 resumability rule, rather than starting from scratch.

## Verification
- `gh auth status`, `vercel whoami`, and `/mcp` all report authenticated.
- A test `pnpm install && pnpm build` succeeds in a re-cloned site repo.
- A new Claude Code session, pointed at an existing site, correctly reports
  that site's current state (from `site.json`) rather than treating it as
  new.

## Escalation
Any secret that cannot be restored from the password manager (lost, not
just misplaced) -> [HUMAN] must rotate/reissue it (new `VERCEL_TOKEN`, new
GSC service-account key, etc.) — AI never re-derives or guesses a
credential value.
