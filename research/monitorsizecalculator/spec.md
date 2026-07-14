# Specification — Monitor Size Calculator

> BINDING contract (design doc §7.1.6): no implementation before Gate G2 passes.
> Every heading below is non-empty. "The spec doesn't say" ⇒ ask or amend
> the spec — never improvise silently. Formulas and data carry citations.
>
> **STATUS: BINDING** — G1 passed 2026-07-14 (all five checks incl. Ahrefs volume
> + D-11 price artifacts, see `g1-evidence.md`); G2 human approval recorded
> 2026-07-14 ("i approve the spec plan"). §6 keyword map amended post-approval
> per G1 data (main-keyword pivot, flagged to operator): see g1-evidence.md.
>
> **Identity** (from `site.config.mjs` — the template's single identity file,
> rewritten by `automation/new-site.mjs` at P3; see ADR-0013): name **Monitor
> Size Calculator** · domain **monitorsizecalculator.com** · main keyword
> **monitor size calculator**.
> Source authorities: P1 research artifacts in `research/monitorsizecalculator/`
> (`scorecard.json`, `scorecard.md`, `serp-analysis.json`, `keyword-research.json`);
> §2.2 row A3 functional sketch (binding). P-02 skill · Opus · G1 scorecard
> total 28/35 (G1 closure pending the two [HUMAN] artifacts above).

## 1. Overview

Monitor Size Calculator is a single-page, client-side tool that converts a
screen's **diagonal size** and **aspect ratio** into its real physical
**width, height, area, and pixel density (PPI)**, in both inches and
centimetres, and places the result in context with a **comparison table of
common monitor sizes**. It answers the buyer/researcher questions "how wide is
a 27-inch monitor?", "how many cm is a 24-inch screen?", "will a 32-inch fit my
desk?", and "what PPI will I get at this resolution?" — all on one modern,
mobile-first page.

**Audience**: consumers comparing or shopping for computer monitors, desk-space
planners, and PC builders. Not a YMYL topic; no data-accuracy liability (all
outputs are deterministic geometry from user input). Risk score R=5.

**The single problem it solves**: manufacturers quote only the diagonal ("27
inch"), which alone does not tell you the actual width, height, footprint, or
sharpness — those depend on aspect ratio and resolution. The tool computes the
missing physical dimensions exactly, instantly.

**Competitive wedge (from `scorecard.md` "The winning wedge" + `serp-analysis.json`
competitor gap analysis — binding as features).** No page in the observed top-10
offers, on one modern mobile-first page, the full set: diagonal + aspect-ratio
**presets** (16:9 / 16:10 / 21:9 / 32:9 / 4:3 / custom) → width / height /
**area** / **PPI** **plus** a **common-monitor comparison table**. Specifically:
- Omni (#2) has **no PPI in-tool** (exiled to a separate calculator) and **no
  comparison table** and no common-monitor presets. → We include PPI in-tool
  (F-06) and a comparison table (F-07) and quick presets (F-12).
- Display Wars (#6) is comparison-only with **no numeric width/height/area/PPI**
  output and a dated, only-recently-mobile UI. → We output all four numbers and
  ship mobile-first (F-13).
- toolstud.io (#7) has depth but **requires a resolution input** for any output
  and has a 2006-era design. → We make resolution **optional** (PPI is the only
  output that needs it); dimensions/area work from diagonal + ratio alone (F-06).
- screen-size.info (#1) has a **broken HTTPS certificate** and dated hosting. →
  We ship on Vercel with valid TLS (a build/deploy property, not a page feature).

## 2. Page inventory

Astro `output: 'static'`, MPA. Every route below ships at launch.

**Primary + tool:**
| Route | Type | Purpose | Content minimum (§2.3) |
|---|---|---|---|
| `/` | Home | Tool above the fold (F-01…F-13) + ≥600-word explanatory copy + visible FAQ (12 Qs, §6) | tool + ≥600 words + FAQ |

**Long-tail MPA landing pages (7, exactly the set in `keyword-research.json` →
`landing_pages`).** Each: a short intro (150–300 words), the tool **pre-filled**
to the page's size/ratio (via query defaults or an inline instance), a
size-specific facts block, and 2–3 internal links. Each computes its numbers
with the tool's own formulas (no scraped data — see §5).
| Route | Target keyword | Pre-fill |
|---|---|---|
| `/27-inch-monitor-dimensions/` | 27 inch monitor dimensions | 27″, 16:9 |
| `/24-inch-monitor-dimensions/` | 24 inch monitor dimensions / in cm | 24″, 16:9 |
| `/32-inch-monitor-dimensions/` | 32 inch monitor dimensions | 32″, 16:9 |
| `/34-inch-ultrawide-monitor-dimensions/` | 34 inch ultrawide monitor dimensions | 34″, 21:9 |
| `/monitor-size-comparison/` | monitor size comparison (24 vs 27 vs 32 vs 34) | comparison table focus |
| `/monitor-ppi-calculator/` | monitor ppi calculator | PPI mode, resolution input surfaced |
| `/monitor-size-in-cm/` | monitor size in cm converter | cm output emphasis |

**Legal / system set (already exist in `site-template/src/pages/`; content
filled, not re-created):** `/privacy`, `/terms`, `/about`, `/contact`, `/404`,
`/500`. Plus generated `robots.txt` (`src/pages/robots.txt.ts`) and
`sitemap-index.xml` (`@astrojs/sitemap`).

**Total launch routes: 1 home + 7 landing + 4 legal + 404 + 500 = 14** (plus
robots/sitemap artifacts). All copy US-English.

## 3. Features

Numbered `F-01…F-13`; each independently demonstrable. Core-tool features render
inside the `#tool` section of `/` (replacing the template placeholder) and are
reused on landing pages.

- **F-01 Diagonal input with unit toggle (in/cm).** Numeric field + in↔cm
  toggle. When the unit is switched the entered value is converted (F-04 math),
  not merely relabelled. Internally the tool normalises to inches.
- **F-02 Aspect-ratio preset selector.** Presets: **16:9, 16:10, 21:9, 32:9,
  4:3**, plus **Custom**. Selecting a preset recomputes instantly.
- **F-03 Custom aspect ratio (W:H).** Two positive-number fields (W, H) enabled
  when "Custom" is chosen. Validated (both > 0) per F-08.
- **F-04 Width & height output (inches + cm).** Physical width and height shown
  in both units, rounded to 2 decimals. Formula §4 C4.1/C4.2.
- **F-05 Screen area output (sq in + cm²).** Area in both unit systems, 2
  decimals. Formula §4 C4.3.
- **F-06 PPI output with OPTIONAL resolution input.** Two optional integer
  fields (horizontal px, vertical px). When both are present and > 0, show PPI
  (F-06 uses §4 C4.4). When absent, PPI row reads "enter a resolution" and
  dimensions/area still compute. This in-tool PPI is a wedge differentiator
  (Omni lacks it).
- **F-07 Common-monitor comparison table.** A table of common sizes —
  **21.5, 24, 27, 32** (16:9), **34, 38** (21:9), **49** (32:9) — each row
  showing width/height (in + cm) and area, **computed by the tool's own
  formulas at load time** (not scraped; §5). The user's current result is
  highlighted/appended when it matches or is added as a row.
- **F-08 Input validation — zero/negative/empty rejection.** Diagonal ≤ 0,
  empty, non-numeric, or a custom ratio with W ≤ 0 or H ≤ 0 ⇒ an inline error
  message via `aria-live` (§8); **no NaN/Infinity is ever displayed** and the
  output region shows a dash placeholder.
- **F-09 Absurd-value warning (>200 in).** A valid diagonal > 200 inches still
  computes but shows a non-blocking warning ("Unusually large for a monitor —
  double-check your input.") in the `aria-live` region.
- **F-10 Unit persistence in localStorage.** The chosen diagonal unit (in/cm)
  and last aspect-ratio preset persist across reloads under a namespaced key
  (`msc:prefs`). Read on init inside a `try/catch` (private-mode safe); absent
  storage falls back to defaults (in, 16:9).
- **F-11 Live recalculation (no submit button).** All outputs recompute on every
  valid input change (`input`/`change` events). No page reload, no form submit.
- **F-12 Common-size quick-select presets.** One-tap chips for 21.5 / 24 / 27 /
  32 / 34 / 38 / 49 inch that populate diagonal + the size's conventional ratio,
  then recompute — the "monitor buyer" ergonomics Omni's generic page lacks.
- **F-13 Mobile-first responsive single-page layout.** The whole tool + results
  + comparison table are usable on a 375px-wide viewport without horizontal
  scroll (the comparison table scrolls inside its own `overflow-x:auto`
  container). Uses the template design tokens (`@toolfactory/ui` / `global.css`).

## 4. Formulas & data sources (cited)

All outputs are pure deterministic geometry — **no external dataset** (§5). Let
`d` = diagonal, aspect ratio `w:h` (w = horizontal parts, h = vertical parts).

**C4.1 — Width from diagonal & ratio.**
`width = d · w / √(w² + h²)`
**C4.2 — Height from diagonal & ratio.**
`height = d · h / √(w² + h²)`
Derivation: the physical sides are proportional to (w, h); writing them as
(w·t, h·t), the diagonal satisfies `√((w·t)² + (h·t)²) = t·√(w²+h²) = d`, so
`t = d / √(w²+h²)`. This is the Pythagorean theorem applied to the screen
rectangle.
*Sources:* Wikipedia, **"Display size"** (screen size is measured along the
diagonal; article carries a standard width/height/diagonal table used here as an
independent cross-check) — verified live 2026-07-14; Wikipedia, **"Pythagorean
theorem"** (the `a²+b²=c²` relation the derivation rests on).

**C4.3 — Area.** `area = width · height` (area of a rectangle).
*Source:* elementary Euclidean geometry (rectangle area = base × height); cross-
checkable against Wikipedia "Display size" area column.

**C4.4 — Pixel density (PPI).** Given horizontal pixels `pxW`, vertical pixels
`pxH`, and diagonal `d` in **inches**:
`PPI = √(pxW² + pxH²) / d`
*Source:* Wikipedia, **"Pixel density"**, §"Calculation of monitor PPI" —
verified live 2026-07-14, which states verbatim: diagonal resolution
`dₚ = √(wₚ² + hₚ²)` (Pythagorean theorem), then `PPI = dₚ / dᵢ` where `dᵢ` is the
diagonal in inches. Our formula is identical.

**C4.5 — Unit conversion (inch ↔ centimetre).** `cm = inch · 2.54` exactly;
`inch = cm / 2.54`. For area: `cm² = in² · 6.4516` (= 2.54²).
*Source:* the international inch is **defined** as exactly 25.4 mm (2.54 cm) by
the 1959 international yard-and-pound agreement — Wikipedia "Inch"; NIST
Handbook 44 / SP 811. This is a definitional constant, not an estimate.

**Rounding rule (binding for the G4 oracle):** compute in full float precision;
round **only for display** to **2 decimal places**, half-up. PPI displayed to
2 decimals. Aspect-ratio constants used by the acceptance table:
`√337 = 18.357560` (16:9), `√522 = 22.847319` (21:9), `√1105 = 33.241540`
(32:9), `√25 = 5` (4:3, exact), `√356 = 18.867962` (16:10).

No `[ESTIMATE]` values appear in this section — every constant is defined or
derived, not measured.

## 5. Dataset schema

**None (computed).** This is the correct and deliberate answer, not an omission.

The comparison table (F-07) and every landing-page facts block are **generated
at build/run time by the tool's own formulas** (§4 C4.1–C4.5) from two hard-
coded, non-proprietary inputs per row: a diagonal (e.g. 27) and a conventional
aspect ratio (e.g. 16:9). Because those numbers are computed — not copied from
any manufacturer or competitor page — there is **no external dataset to fetch,
schema, or attribute**, and therefore no `source`/`retrieved` provenance fields
are required (design doc §7.2 "external data" tree: data is *derivable*, so it is
derived, never fabricated and never scraped). This also removes the §13.7
per-datum sourcing obligation, which applies only to fetched datasets (e.g.
`phones.json` on a different site).

The only hard-coded constants are the **preset size/ratio pairs** for F-07/F-12,
which are conventions (common retail monitor sizes and their marketing aspect
ratios), listed inline in the component, not a data file:
`[21.5:16:9, 24:16:9, 27:16:9, 32:16:9, 34:21:9, 38:21:9, 49:32:9]`.
Note (honesty): 38″ and some 49″ panels ship at slightly non-nominal ratios
(e.g. 3840×1600 ≈ 24:10) in the real world; the table labels each row with the
ratio it computes at, and the numbers are exact **for that stated ratio** — the
tool never claims to know a specific product's true panel ratio.

## 6. Keyword map

Main keyword and the **15 supporting keywords** are taken verbatim from
`research/monitorsizecalculator/keyword-research.json` (`main_keyword`,
`supporting_keywords[]`). Each maps to a specific page.

**Main (amended per G1 data, 2026-07-14 — see `g1-evidence.md`):**
`screen size calculator` (Ahrefs >1000/mo US, verified) → **`/` (home)** — `<title>`
and primary copy target BOTH phrases (e.g. title "Monitor Size Calculator — Screen
Size Calculator (Width, Height, Area, PPI)"); H1 stays "Monitor Size Calculator"
(site name/domain identity); body copy uses "screen size calculator" naturally.
**Primary supporting:** `monitor size calculator` (>100/mo, exact-match domain) → `/` (home).
The monitor-dimensions landing cluster below (KD **Easy** per Ahrefs) is the
first-traffic wedge — unchanged.

| # | Supporting keyword (G1 artifact) | Target page |
|---|---|---|
| 1 | screen size calculator | `/` (home, secondary H2) |
| 2 | monitor dimensions calculator | `/` (home) |
| 3 | screen dimensions calculator | `/` (home) |
| 4 | monitor ppi calculator / ppi calculator | `/monitor-ppi-calculator/` |
| 5 | aspect ratio calculator | `/` (home, aspect-ratio copy section) |
| 6 | 27 inch monitor dimensions | `/27-inch-monitor-dimensions/` |
| 7 | 24 inch monitor size in cm | `/24-inch-monitor-dimensions/` + `/monitor-size-in-cm/` |
| 8 | 32 inch monitor dimensions | `/32-inch-monitor-dimensions/` |
| 9 | 34 inch ultrawide monitor dimensions | `/34-inch-ultrawide-monitor-dimensions/` |
| 10 | monitor size comparison | `/monitor-size-comparison/` |
| 11 | 24 vs 27 inch monitor | `/monitor-size-comparison/` (dedicated section) |
| 12 | 27 vs 32 inch monitor | `/monitor-size-comparison/` (dedicated section) |
| 13 | monitor viewing distance calculator | **v2 — see §9.** Home FAQ Q11 gives a brief textual answer only; no calculator page in v1. |
| 14 | how wide is a 27 inch monitor | `/27-inch-monitor-dimensions/` + home FAQ Q1 |
| 15 | tv size calculator | **v2 — see §9.** Distinct intent (size→viewing-distance, TV cluster); no page in v1. |

**Per-page `<Seo>` intent** (P5/P6 fills exact strings; ≤60-char title, ≤160-char
description, each containing its target keyword; canonical absolute).

**FAQ content (home) — the 12 questions adapted from
`keyword-research.json` → `questions[]`.** FAQ is **visible content only**, no
`FAQPage` JSON-LD (design doc D-10). Answer guidance below; where marked
**[from tool math]** the numeric answer MUST be produced by §4 formulas (and
therefore agrees with §10), never asserted from memory:
1. *How wide is a 27 inch monitor?* → **[from tool math]** 23.53 in / 59.77 cm
   wide, 13.24 in / 33.62 cm tall (16:9). Link `/27-inch-monitor-dimensions/`.
2. *What are the dimensions of a 24-inch monitor?* → **[from tool math]** 20.92 ×
   11.77 in (53.13 × 29.89 cm), 16:9.
3. *How big is a 32-inch monitor?* → **[from tool math]** 27.89 × 15.69 in
   (70.84 × 39.85 cm), 16:9; area ≈ 437.6 sq in.
4. *How many cm is a 24 inch monitor?* → **[from tool math]** diagonal 60.96 cm;
   width 53.13 cm, height 29.89 cm (16:9). Link `/monitor-size-in-cm/`.
5. *Is a 32 inch monitor too big for gaming?* → qualitative; explain PPD/viewing-
   distance trade-off in plain language; cite the tool's PPI output as the
   sharpness factor. No performance claims.
6. *Is monitor size measured diagonally, and does it include the bezel?* →
   Yes, diagonal of the **active display area**, bezel excluded (cite the
   convention; Wikipedia "Display size"). This is why physical width/height need
   the calculator.
7. *How far should I sit from a 27 inch monitor?* → brief textual rule-of-thumb;
   note a dedicated viewing-distance calculator is planned (v2, §9). No formula
   page in v1.
8. *Why does a 34-inch ultrawide feel smaller than a 27-inch 16:9?* →
   **[from tool math]** compare heights: 34″ 21:9 is 13.39 in tall vs 27″ 16:9 at
   13.24 in — nearly identical height, so a "bigger" ultrawide gains width, not
   height. Compelling, verifiable, differentiating.
9. *Is 1080p good enough on a 32 inch monitor?* → **[from tool math]** 32″ 1080p =
   ~68.84 PPI vs 27″ 1440p = ~108.79 PPI; explain the low-density trade-off.
10. *How much desk space does a 32/34 inch monitor need?* → **[from tool math]**
    width 70.84 cm (32″) / 79.38 cm (34″ 21:9); note stand depth is product-
    specific and out of scope (§9).
11. *What monitor size should I get for my viewing distance?* → qualitative;
    dedicated calculator is v2 (§9).
12. *What is the screen area difference between a 24 and 27 inch monitor?* →
    **[from tool math]** 27″ ≈ 311.50 sq in vs 24″ ≈ 246.12 sq in → ~26.6% more
    area despite only 3″ more diagonal. Link `/monitor-size-comparison/`.

## 7. Island/hydration plan

**Decision: a single vanilla `<script>` island. No React. No `@astrojs/react`,
no shadcn.** Justified explicitly against design doc §7.2 decision tree:

- *Does this component need client JS?* Yes — live recalculation, unit toggle,
  localStorage.
- *Is it the core tool?* Yes → the tree permits "one React island `client:load`
  **or vanilla `<script>` if trivial**." This tool **is** trivial by that
  test: its entire state is 4–6 primitive inputs (diagonal, unit, ratio preset,
  custom W/H, optional pxW/pxH); its logic is ~40 lines of arithmetic (§4); it
  renders into a fixed DOM skeleton already present in the Astro page. There is
  **no component tree, no shared React context, no list virtualisation, no
  async** — nothing React buys. Adding React + shadcn would pull a hydration
  runtime and the §5 tsconfig-alias/init ceremony onto a page that would
  otherwise ship **zero framework JS**, directly helping the LHCI perf ≥0.90
  gate (G5) and TBT/LCP.
- *Below fold / shares context?* N/A — one island, one context boundary.

**Implementation shape:** the interactive markup lives in `index.astro` (and a
shared `MonitorCalc.astro` partial reused by landing pages) with inputs as plain
`<input>/<select>/<button>` elements; a co-located `<script>` (module, runs on
load — the tool is above the fold so no `client:*` directive concept applies to
a raw Astro `<script>`) wires `input`/`change` listeners, computes §4 formulas,
writes results into `aria-live` output nodes, and reads/writes `localStorage`.
The comparison table (F-07) is **pre-rendered server-side** in Astro from the
same formula functions (import a plain `.ts`/`.mjs` calc module at build time) so
it is present in static HTML for SEO and needs no hydration; the script only
appends/highlights the user's live row. Landing pages import the same partial +
calc module. **No new runtime dependency is added** (§4.6 rule) — the calc module
is first-party.

## 8. A11y notes

Target: axe 0 critical/serious (G5); keyboard-only operable (P-08); WCAG AA
contrast from `docs/design-spec.md` tokens (no ad-hoc colors, §7.1).

- **Labels:** every input has an associated `<label for>` (diagonal, unit toggle,
  aspect preset, custom W, custom H, resolution W, resolution H). The unit toggle
  and quick-select chips are real `<button>`s with descriptive text (e.g.
  "Set diagonal to 27 inches"), not click-only `<div>`s.
- **Keyboard:** all inputs, the preset `<select>`, unit toggle, and quick-select
  chips are reachable and operable by Tab / Shift-Tab / Enter / Space / arrow
  keys (native controls only — a consequence of the §7 no-custom-widget choice).
  Visible focus ring from design tokens; logical DOM/tab order top-to-bottom.
- **Live outputs:** the results region (width/height/area/PPI) is an
  `aria-live="polite"` container so screen readers announce recomputed values on
  input change (F-11). Validation errors (F-08) and the >200″ warning (F-09) go
  to an `aria-live="assertive"` (or `role="alert"`) node so they are announced
  immediately; inputs in error also carry `aria-invalid="true"` and
  `aria-describedby` pointing at the message.
- **Comparison table (F-07):** a real `<table>` with `<caption>`, `<th scope>`
  headers; wrapped in an `overflow-x:auto` region with an accessible label so
  keyboard users can scroll it (F-13).
- **Contrast:** all text/UI meets WCAG AA (≥4.5:1 body, ≥3:1 large/UI) using the
  reviewed design tokens; dark-mode variants inherit the template's tokens.
- **No motion/color-only signalling:** errors use text + icon + `aria`, not color
  alone.

## 9. Out of scope

Explicitly excluded from v1 to prevent scope invention during build (§7.1 rule 6).
Each is either a deliberate v2 candidate or a hard exclusion:

- **Visual to-scale overlay comparison** (Display Wars-style graphical outline of
  two screens). **v2 candidate.** v1 ships the numeric comparison table (F-07)
  only.
- **Curved-screen depth math** (base depth / base width for curved panels, as
  Omni offers). Excluded — adds radius input and non-obvious geometry for a small
  audience.
- **Viewing-distance calculator** (optimal seating distance, PPD / 30° FOV rules).
  **v2 candidate landing page** (`monitor viewing distance calculator`, kw #13).
  v1 answers Q7/Q11 textually only; no calculator, no dedicated page.
- **TV-specific content / TV size calculator** (kw #15). Distinct intent cluster
  (size→viewing-distance, different audience). Excluded from v1; possible
  separate future page, not this site's core.
- **Multi-monitor layout planning** (arranging/rearranging multiple monitors,
  wallpaper span — the multimonitorcalculator.com angle). Excluded.
- **Product/stand depth, weight, or VESA data** — would require a fetched,
  attributed dataset (§5 says none); excluded to keep the tool pure-computed. Q10
  notes stand depth is product-specific.
- **No `FAQPage` / rating / review JSON-LD** (design doc D-10, §13.4) — FAQ stays
  visible content; `WebApplication` + `BreadcrumbList` + `Organization` schema
  only, no `aggregateRating`/`review` fields.
- **No React/shadcn, no runtime deps beyond §5 stack** (§7 decision).

## 10. Acceptance checklist

Per formula-bearing feature: **3 exact input→output pairs, computed and verified
by hand** (the G4 test oracle; §7.3). Display rounding = 2 dp half-up (§4).
Commit refs filled at G4.

**F-04 — Width & height (in + cm)** — `width = d·w/√(w²+h²)`, `height = d·h/√(w²+h²)`, `cm = in·2.54`
- [ ] 27″, 16:9 → width **23.53 in / 59.77 cm**, height **13.24 in / 33.62 cm**  (commit: …)
- [ ] 24″, 16:9 → width **20.92 in / 53.13 cm**, height **11.77 in / 29.89 cm**  (commit: …)
- [ ] 20″, 4:3 → width **16.00 in / 40.64 cm**, height **12.00 in / 30.48 cm** (exact integer oracle, √25=5)  (commit: …)

**F-04 (ultrawide/superwide coverage)** — same formula, non-16:9 ratios
- [ ] 34″, 21:9 → width **31.25 in / 79.38 cm**, height **13.39 in / 34.02 cm**  (commit: …)
- [ ] 49″, 32:9 → width **47.17 in / 119.81 cm**, height **13.27 in / 33.70 cm**  (commit: …)
- [ ] 32″, 16:9 → width **27.89 in / 70.84 cm**, height **15.69 in / 39.85 cm**  (commit: …)

**F-05 — Screen area (sq in + cm²)** — `area = width·height`, `cm² = in²·6.4516`
- [ ] 27″, 16:9 → **311.50 sq in / 2009.68 cm²**  (commit: …)
- [ ] 24″, 16:9 → **246.12 sq in / 1587.90 cm²**  (commit: …)
- [ ] 34″, 21:9 → **418.55 sq in / 2700.33 cm²**  (commit: …)

**F-06 — PPI (optional resolution)** — `PPI = √(pxW²+pxH²)/d`, d in inches
- [ ] 27″, 2560×1440 → **108.79 PPI**  (commit: …)
- [ ] 24″, 1920×1080 → **91.79 PPI**  (commit: …)
- [ ] 32″, 3840×2160 → **137.68 PPI**  (commit: …)

**F-01 / F-04 — Unit conversion (diagonal in↔cm)** — `cm = in·2.54`
- [ ] 27 in → **68.58 cm**  (commit: …)
- [ ] 24 in → **60.96 cm**  (commit: …)
- [ ] 32 in → **81.28 cm**  (commit: …)

**F-07 — Comparison table (computed rows, spot-check)** — same F-04/F-05 formulas
- [ ] 21.5″, 16:9 → **18.74 × 10.54 in** (47.60 × 26.77 cm)  (commit: …)
- [ ] 38″, 21:9 → **34.93 × 14.97 in** (88.72 × 38.02 cm)  (commit: …)
- [ ] 49″, 32:9 → **47.17 × 13.27 in** (119.81 × 33.70 cm) (matches F-04 row)  (commit: …)

**F-08 — Validation (no NaN/Infinity)**
- [ ] diagonal = 0 → error "Enter a positive diagonal", outputs show "—" (no `0`/`NaN`)  (commit: …)
- [ ] diagonal = −27 → same error, no computed output  (commit: …)
- [ ] Custom ratio W=16, H=0 → error "Both ratio values must be greater than 0"  (commit: …)

**F-09 — Absurd-value warning**
- [ ] diagonal = 250″, 16:9 → warning shown AND width still computes (217.89 in / 553.45 cm)  (commit: …)
- [ ] diagonal = 200″ → no warning (boundary; 200 is not > 200)  (commit: …)
- [ ] diagonal = 201″ → warning shown  (commit: …)

**F-10 — Unit persistence**
- [ ] set unit = cm, reload → unit is still cm  (commit: …)
- [ ] set preset = 21:9, reload → preset still 21:9  (commit: …)
- [ ] localStorage blocked/private mode → tool loads with defaults (in, 16:9), no crash  (commit: …)

**F-11 — Live recalculation**
- [ ] change diagonal 27→32 (16:9) → width updates 23.53→27.89 in with no submit/reload  (commit: …)
- [ ] switch preset 16:9→21:9 at 34″ → height updates to 13.39 in live  (commit: …)
- [ ] enter resolution 2560×1440 at 27″ → PPI appears (108.79) without reload  (commit: …)

---
*All numeric outputs above were computed to full precision from §4 formulas and
rounded to 2 dp for display; they are the binding oracle for G4 unit tests
(3 known I/O pairs per formula, §8 P4 / §7.3).*
