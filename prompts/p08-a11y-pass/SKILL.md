---
name: p08-a11y-pass
description: >-
  Run an accessibility pass against the live preview using axe-core via the Playwright
  MCP, then fix findings. Use at Phase P5 QA (feeds Gate G5). Trigger on "a11y pass",
  "accessibility check", "run axe", "check keyboard nav", or when a built tool has not
  yet been audited for accessibility.
model: sonnet
effort: medium
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# P-08 a11y-pass

Operational instructions for the accessibility pass (design doc §8 P5, §7.3, §5). Judgment must be DOM-grounded — drive the real preview. When a WCAG call is contested, the axe-core report is the source of truth.

## Purpose
Bring the site to zero critical/serious axe violations and confirm the tool is fully operable keyboard-only, satisfying the a11y half of Gate G5.

## Inputs
- The live preview (`pnpm build` then `astro preview`, or `pnpm dev`) — drive it via the Playwright MCP.
- `spec.md` §8 a11y notes — the intended accessible behavior.

## Outputs
- axe-core report(s) captured against key pages (home, a landing page, tool interaction states).
- Code fixes for every critical/serious finding (labels, roles, contrast, focus order, alt text, ARIA where genuinely needed).
- Notes in `site.json` on any contested/waived items with the axe evidence.

## Acceptance criteria
- axe-core reports **0 critical and 0 serious** violations across audited pages (§8 G5).
- The core tool is fully operable keyboard-only (tab order logical, all controls reachable and actuatable, visible focus states) — verified by driving it via Playwright MCP with keyboard input.
- Color contrast meets the WCAG AA floors from `docs/design-spec.md` (including dark mode).
- No regressions introduced to `tests/smoke.spec.ts` or the Playwright suite.

## Failure cases (enumerated → action)
- A finding is contested (is it really a violation?) → the **axe-core output is truth**; fix it or record an evidence-backed waiver in `site.json`.
- A fix would break the design tokens/contrast floors → adjust within `docs/design-spec.md` tokens, not ad hoc; if tokens themselves fail AA, route to the design source of truth (§7.1).
- Keyboard operation impossible for a control as built → refactor the control (native element over div-with-handlers); do not paper over with ARIA alone.

## Escalation (§6.5)
- Same a11y failure 3× at Sonnet → escalate one tier (Opus).
- Anything touching credentials/ToS/publishing → **[HUMAN]** (not expected here).
- Gate G5 a11y criterion ambiguous → fix the gate definition in §8 before proceeding.
