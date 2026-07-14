---
name: p01-research-validate
description: >-
  Run the §2.1 selection engine for a single micro-tool idea: gather search-volume,
  SERP, keyword, domain and scoring evidence into research/ and emit a schema-valid
  scorecard. Use at Phase P1 when a candidate idea needs validation before it can pass
  Gate G1 and advance IDEA → VALIDATED. Trigger on "validate this idea", "score this
  tool", "run discovery", or when portfolio.json has a site in state IDEA.
model: sonnet
effort: high
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch, WebFetch
---

# P-01 research-validate

Operational instructions for the AI executing discovery & validation (design doc §2.1, §8 P1). You are producing objective evidence, not opinions. Every number is either backed by a captured artifact in `research/` or tagged `[ESTIMATE]`.

## Purpose
Score one idea with the repeatable rubric `Score = 2C + 1.5D + 1.5M + B + R` (max 35) and produce the artifacts Gate G1 checks. Recommend BUILD (≥22), PARK (18–21), or REJECT (<18).

## Inputs
- `idea` (string) — the micro-tool concept. Passed as `$ARGUMENTS` (e.g. `/p01-research-validate monitor size calculator monitorsizecalculator.com`).
- `main_keyword` (string) — the primary target keyword.
- `candidate_domain` (string, `.com`) — the exact-match or modifier domain to check.
- `site_dir` (path) — the site working directory containing `research/`, `site.json`, `site.config.mjs`.

## Outputs
- `research/volume.md` — main-keyword monthly US volume with the source (Ahrefs Free KG screenshot/CSV path, or Keyword Planner, or explicit `[ESTIMATE]`).
- `research/serp.md` — top-10 SERP table, ≥10 rows, each row: rank, URL, type (dedicated tool / multi-tool portal / forum / gov / thin), age/quality notes. Include the search date.
- `research/keywords.md` — harvested Questions tab (→ FAQ candidates), Related terms (→ supporting keywords), autocomplete suggestions.
- `research/domain.md` — RDAP result (via `node automation/rdap-check.mjs <domain>`; 404 = likely available) with same-day timestamp, plus the registrar price screenshot path (`research/domain-price.png`) proving checkout < ₹1,200 first year (D-11).
- `research/scorecard.json` — schema-valid against the P-01 scorecard schema (C,D,M,B,R,total, plus rationale strings and evidence paths).
- `research/scorecard.md` — human-readable render of the same scores with the BUILD/PARK/REJECT verdict.

## Acceptance criteria
- `research/scorecard.json` validates against its schema; `C,D,M,B,R` each in 0–5; `total` equals `2C + 1.5D + 1.5M + B + R`.
- Every numeric claim in every artifact is either linked to a captured source file in `research/` or carries the literal tag `[ESTIMATE]` (untagged unverifiable numbers are defects, §7.1).
- `research/serp.md` has ≥10 result rows.
- Domain RDAP checked the SAME calendar day as the scorecard; price screenshot present and shows < ₹1,200 first year, else `D` scored per the rule below.
- Volume evidence artifact exists (`research/volume.md` with a real source or an explicit `[ESTIMATE]` degradation).
- Scoring rules applied exactly: `C` (5 = ≥3 of top-10 are forums/thin/gov; 3 = weak dedicated incumbents; 0 = entrenched branded); `D` (5 = exact-keyword `.com` available at standard price; **premium/aftermarket price ⇒ D = 0** regardless of quality); `M` (CPM tier minus adblock exposure, dev audiences −2); `B` (5 = static calc, easiest build); `R` (5 = safest; YMYL −3).

## Failure cases (enumerated → action)
- Search volume unverifiable → label the figure `[ESTIMATE]` in `research/volume.md`, add it to `site.json.ESTIMATES[]`, and degrade the `D`/monetization confidence note; do not fabricate a number.
- SERP ambiguous (mixed/unclear incumbent types) → run a second manual pass; if still ambiguous, cap `C` at 3.
- RDAP returns 200 (taken) or a reserved/redemption state → domain unavailable; score `D` accordingly and surface the verified-available backup list (§2.2) instead of inventing availability.
- Registrar price ≥ ₹1,200 or premium/aftermarket listing → score `D = 0` (D-11), note in `scorecard.md`.
- Total < 22 → emit the scorecard with an explicit PARK/REJECT verdict; do NOT advance state or trigger P-02.

## Escalation (§6.5)
- Same scoring error repeated 3× → escalate one tier (this skill runs at Sonnet; escalate to Opus for a re-score of the shortlist).
- Anything touching a purchase, registrant PII, or ToS acceptance → **[HUMAN]** (RDAP checks and price *screenshots* are fine; buying is not — final purchasability is confirmed only at registrar checkout by a human, P7).
- If G1's pass/fail becomes ambiguous, the gate definition is the defect — stop and flag §2.1 rather than reinterpreting the check.
