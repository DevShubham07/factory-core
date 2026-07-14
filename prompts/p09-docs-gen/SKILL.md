---
name: p09-docs-gen
description: >-
  Regenerate the per-site README and site.json notes from the actual repo state —
  accurate commands, no invented flags. Use whenever docs have drifted from reality or
  after a milestone. Trigger on "update the README", "regenerate the docs", "docs are
  stale", or after a gate pass that changed commands/structure.
model: haiku
effort: low
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# P-09 docs-gen

Operational instructions for documentation generation (design doc §8, §12). Generate from the files, not from memory. Every command you document must exist and run.

## Purpose
Keep the site's README and `site.json` notes accurate to the current repo state.

## Inputs
- Current repo files — `package.json` scripts, `astro.config.mjs`, `spec.md`, `tests/`, `site.config.mjs`.
- `state` (string, optional) — the current lifecycle state, passed as `$ARGUMENTS` or read from `site.json`.

## Outputs
- `README.md` — accurate setup/build/test/deploy commands, tool description sourced from `spec.md`, page inventory, and the pinned stack from §5.
- `site.json` notes fields updated to reflect current state (never hand-edit the `gates[]` history — append only, §3.3).

## Acceptance criteria
- Every command in the README exists in `package.json`/the toolchain and runs as written (verify against the actual scripts — e.g. `pnpm build`, `pnpm exec playwright test`).
- No invented flags, scripts, or file paths — every referenced file exists.
- Tool description and page list match `spec.md` and the actual `src/pages/` tree.
- `site.json` gate history is untouched (append-only discipline preserved).

## Failure cases (enumerated → action)
- Docs drift from reality → regenerate from the files, not from memory or a prior README.
- A documented command no longer exists → remove/replace it with the real one; never leave an invented flag.
- Uncertain what a script does → read it; do not guess its behavior.

## Escalation (§6.5)
- Same generation failure 3× at Haiku → escalate one tier (Sonnet).
- Any doc implying money/credentials/ToS/publishing steps → mark **[HUMAN]**, do not present as automated.
