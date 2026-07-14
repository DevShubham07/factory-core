---
name: p02-write-spec
description: >-
  Author the binding functional contract spec.md for a validated micro-tool site.
  Use at Phase P2 after Gate G1 passes (state VALIDATED) to produce the spec that
  every later build stage is held to. Trigger on "write the spec", "spec this tool",
  or when a site sits in state VALIDATED with G1 evidence in research/. This is the
  highest-leverage authoring stage — spec errors replicate through the whole build.
model: opus
effort: high
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebFetch
---

# P-02 write-spec

Operational instructions for the AI writing `spec.md` (design doc §8 P2, §3.3). This is a **binding contract**, not a draft. The implementer (P-03) may build only what this spec authorizes. When a data source cannot be verified, the feature moves out-of-scope — it is never invented.

## Purpose
Turn the G1 research artifacts plus the §2.2 functional spec for this tool into a complete, citation-backed `spec.md` that satisfies Gate G2 and unblocks state SPECED.

## Inputs
- `tool_name` (string) and `domain` (string) — read from `site.config.mjs`. Overridable via `$ARGUMENTS`.
- G1 artifacts (files) — `research/scorecard.json`, `research/serp.md`, `research/keywords.md`, `research/volume.md`.
- The §2.2 binding functional spec row for this tool (the implementer must not invent beyond it + this spec).

## Outputs
- `spec.md` — filling the BINDING heading set exactly (§4.4). Every heading must be non-empty:
  1. Overview · 2. Page inventory (home + MPA landing pages) · 3. Features · 4. Formulas & data sources (each **cited** — e.g. ISO/IEC 7810 ID-1 for card width, WPM research ranges) · 5. Dataset schema (with per-datum `source` + `retrieved` fields where a dataset exists) · 6. Keyword map (main + supporting + landing pages, each referencing a G1 artifact) · 7. Island/hydration plan (per §7.2 decision tree) · 8. A11y notes · 9. Out of scope · 10. Acceptance checklist (feature-by-feature, to be ticked with commit refs at G4).
- Update `site.json`: record that the spec was produced and, once the human reads it, the approval.

## Acceptance criteria
- Every one of the 10 mandatory headings is present and non-empty (G2).
- Every formula and every datum in the spec carries an inline citation to an authoritative source; unverifiable data → listed in §9 Out of scope, never invented (§7.1, §13.7).
- The keyword map (§6) references specific G1 artifacts (`research/keywords.md` rows).
- §7 island plan follows the hydration policy: `client:load` only for the core tool island, `client:visible`/`client:idle` below fold, no directive for presentational components, one island per React-context boundary (§5, §7.2).
- Out-of-scope section (§9) is present and explicitly lists deferred/unverifiable features (e.g. camera/ML for the PD Ruler).
- Any medical-adjacent tool (PD Ruler) records the required disclaimer as a spec item (§13.6); any dataset records the per-datum sourcing rule (§13.7).
- Human approval recorded in `site.json` before state advances to SPECED (10-minute read, §8 P2).

## Failure cases (enumerated → action)
- A required feature depends on a data source that cannot be authoritatively verified → move the feature to §9 Out of scope; never fabricate the data or the formula.
- Ambiguity discovered here or later → amend the spec via an ADR-lite note (record in `site.json`); never let the build silently improvise around a gap (§7.1 rule 6).
- A §2.2 requirement conflicts with a compliance rule (§13) → the compliance rule wins; document the resolution in §9.

## Escalation (§6.5)
- Opus (this model) fails to produce a G2-passing spec twice → stop, reduce scope or split the tool, and record an ADR-lite note in `site.json`.
- Any spec item implying money/credentials/ToS/third-party publishing → mark it **[HUMAN]** in the spec, do not encode it as automatable.
- If G2 cannot be objectively evaluated for this spec, the gate definition is defective — fix §8 G2 before proceeding.
