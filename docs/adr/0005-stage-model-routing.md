# 0005 - Route AI stages by economics, not a fixed model cascade

## Status
accepted

## Context
The originally proposed Fable 5 -> Opus -> Sonnet -> Haiku waterfall
mismatches this workload: Fable 5's premium buys long-running-agent
coherence the factory doesn't need (many short, parallel, template-driven
stages), and a fixed cascade forces expensive models onto mechanical stages
and cheap models onto high-leverage ones.

## Decision
Route per stage by two axes: leverage (does an error replicate across the
fleet?) and volume (does this run per-site or once?). The stage->model
matrix (design doc §6.3) assigns Haiku to mechanical/high-volume legs
(triage, scaffolding, docs-gen, monitoring), Sonnet as the default
build/session model (implementation, testing, SEO copy, verification), and
Opus to high-leverage, low-volume, error-replicates-fleet-wide stages (spec
writing, pre-G5 code review, monthly portfolio audit). Fable 5 is reserved
for one optional future case: a long unattended fleet-audit orchestrator.

## Consequences
- Routing is encoded in the repo (skill frontmatter `model:`/`effort:`,
  subagent files), not remembered by the operator.
- Escalation ladder (§6.5): same error 3x at assigned model escalates one
  tier; Opus failing twice stops work for an ADR-lite note, never silent
  improvisation.
- Per-site AI cost estimate: 1-4M tokens, ~$5-25/site `[ESTIMATE]`.
