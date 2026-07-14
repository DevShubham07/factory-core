---
name: p14-prompt-optimizer
description: >-
  Revise an underperforming SKILL.md from its failure log, preserving all contract
  fields and recording an A/B rationale + changelog entry. Use when a skill repeatedly
  produces off-contract output. Trigger on "improve this skill", "optimize the prompt",
  "this skill keeps failing", or when a skill's failure log accumulates.
model: opus
effort: high
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# P-14 prompt-optimizer

Operational instructions for skill self-improvement (design doc §10, §12.4). Revise a skill from evidence of its failures while keeping the uniform contract intact. Every change is reversible via git.

## Purpose
Produce a revised `SKILL.md` for a named skill that measurably reduces its failure mode, with a recorded A/B rationale and changelog entry — never at the cost of a lost contract field.

## Inputs
- `skill_id` (string) — the target skill, e.g. `p06-seo-onpage`, passed as `$ARGUMENTS`.
- `failure_log` (path/text) — the accumulated failures/off-contract outputs motivating the change.
- The current `SKILL.md` for that skill (canonical source in `factory-core/prompts/`, installed copy in `site-template/.claude/skills/<id>/SKILL.md`).

## Outputs
- A revised `SKILL.md` for the target skill.
- A changelog entry recording the change and the A/B rationale (what failure it addresses, why the new wording should fix it).
- The canonical `factory-core/prompts/` source and the `site-template` installed copy kept in sync.

## Acceptance criteria
- **All uniform-contract fields are preserved**: frontmatter (`name`, `description`, `model`, `effort`, `allowed-tools`) and body sections Purpose · Inputs · Outputs · Acceptance criteria · Failure cases · Escalation. Dropping any is a defect.
- The `model`/`effort` routing stays consistent with the §10 table unless the change is explicitly a routing ADR.
- An A/B rationale is recorded (the specific failure targeted, the hypothesis for the fix).
- A changelog entry is written; the change is a clean git commit (revertible).
- No compliance guardrail is weakened (e.g. the JSON-LD no-ratings rule, FAQ-visible-only rule, Indexing-API prohibition must survive any rewrite).

## Failure cases (enumerated → action)
- The revision regresses skill quality (worse on the failure log or on prior-good cases) → **revert via git**; do not ship a worse prompt.
- A contract field would be lost by the edit → reject the edit; restructure to keep all fields.
- The fix implies a model-routing change → gate it behind an ADR (§12.2), do not silently re-route.

## Escalation (§6.5)
- Opus (this model) fails twice to produce a non-regressing revision → stop; keep the current skill and record an ADR-lite note.
- Any change touching money/credentials/ToS/publishing behavior of a skill → **[HUMAN]** review before it ships.
- If a skill's acceptance criteria can't be objectively evaluated, the gate/criterion is the defect — fix the definition, not just the prose.
