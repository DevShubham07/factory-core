# Specification — Speech Length Calculator

> BINDING contract (design doc §7.1.6): no implementation before Gate G2 passes.
> Every heading below is non-empty. "The spec doesn't say" ⇒ ask or amend the
> spec — never improvise silently. Formulas and data carry citations.
>
> **STATUS: DRAFT** — becomes BINDING only after **G1 fully closes** and **G2
> human approval**. Two G1 artifacts are still **PENDING [HUMAN]**, batched with
> the operator's bulk-domain session: (1) **Ahrefs search-volume capture** for
> `words to minutes` (the >1,000 US/mo §2.1 floor is currently only `[ESTIMATE]`
> 10k–25k — see `scorecard.json`/`keyword-research.json`); (2) **D-11 registrar
> price screenshot** (< ₹1,200 first year at Namecheap for
> `speechlengthcalculator.com`). RDAP-404 was re-verified 2026-07-15.
>
> **⚠ MARGINAL SCORECARD FLAG (operator decision required at G2):** total
> **22.5 / 35**, only **0.5 above** the Build threshold (≥22). The score hinges
> on the competition two-pass: rubric-literal **C=3** (used) → 22.5 = Build; the
> conservative first pass **C=2** → **20.5 = PARK**. Per the site-1 precedent
> (same 2-vs-3 hinge) the operator should confirm the C=3 read at spec approval;
> an Ahrefs `words to minutes` print at/above the 1,000-US/mo floor makes C=3
> safe to accept. If C=2 stands, this site PARKS and this spec does not bind.
>
> **Identity** (from `site.config.mjs` — the template's single identity file,
> rewritten by `automation/new-site.mjs` at P3; see ADR-0013): name **Speech
> Length Calculator** · domain **speechlengthcalculator.com** · main keyword
> **words to minutes** (secondary exact-match: **speech length calculator**).
> Source authorities: P1 research artifacts in `research/speechlengthcalculator/`
> (`scorecard.json`, `serp-analysis.json`, `keyword-research.json`,
> `research-notes.md`); design-doc §2.2 row **A5** functional sketch (binding),
> §2.3 content minimums, §7 anti-hallucination rules, §13 compliance. P-02 skill ·
> Opus · G1 scorecard total 22.5/35 (G1 closure pending the two [HUMAN] artifacts
> above).

## 1. Overview

Speech Length Calculator is a single-page, client-side tool that converts a
block of **text (pasted or typed)** — or a raw **word-count number** — into an
estimated **speaking time** and **silent-reading time**, with a user-adjustable
**speaking rate (100–180 WPM)** exposed as both a **slider** and **Slow / Average
/ Fast presets**, plus **live word and character counts**. It answers "how long
will my speech run?", "how many words do I need for a 5-minute speech?", and "how
long does it take to read 1000 words?" — all on one modern, mobile-first page.

**Audience**: students, public speakers, presenters, debaters, podcasters,
voice-over artists, and video-script writers estimating delivery time. Not a YMYL
topic. All outputs are deterministic arithmetic from user input and published
rate constants — there is **no data-accuracy liability** (every rate is framed as
an estimate and cited). Risk score **R=4** (−1 vs a pure calc for thin-content /
duplicate-utility AdSense risk in a saturated niche — mitigated, not eliminated,
by the §2.3 content minimums enforced below).

**The single problem it solves**: a speaker or writer knows their word count (or
target duration) but not how that maps to *time on stage*, because the mapping
depends on speaking rate — which no incumbent lets you both **see cited** and
**adjust**. The tool computes the mapping (both directions) instantly.

**Competitive wedge (from `research-notes.md` "The winning wedge" +
`serp-analysis.json` competitor-gap analysis — binding as features).** No page in
the observed top-10 offers, on **one page**, the full set. The five structural
gaps (each closed by construction):

1. **Both input modes** — paste text AND raw word-count number. (wordstotime.com /
   timemywords.com have both; Debatrix & howlongismyspeech are paste-only.) → **F-01**.
2. **100–180 WPM slider AND labeled Slow/Avg/Fast presets together** —
   speechtimecalculator.com is the *only* incumbent with a slider (locked-feeling
   default 183) and it has no labeled presets; every other tool has 3–4 fixed
   presets and no slider. Nobody pairs them. → **F-04 + F-05**.
3. **Speaking time AND silent-reading time side by side** — only wordstotime.com
   (a toggle, not side-by-side) and speechtimecalculator.com (reading locked at
   238) cover both intents. → **F-06 + F-07 + F-08**.
4. **Live word count + character count** — only howlongismyspeech.com and
   speechtimecalculator.com show char counts. → **F-02 + F-03**.
5. **A per-duration landing-page cluster with a live calculator on each** — **no**
   dedicated-tool incumbent has any; `/how-many-words-is-a-5-minute-speech/`-class
   queries are held entirely by static blog articles (wordcounter.io/.net, SEEK,
   Indeed, Quora, capitalizemytitle) with **no calculator on the page**. This is
   the biggest gap. → **§2 landing pages + F-09 + F-18**.

Secondary trust wedge (steal from Debatrix): **in-browser privacy** — text is
never uploaded or stored (**F-14**).

## 2. Page inventory

Astro `output: 'static'`, MPA. Every route below ships at launch. All copy US-English.

**Primary + tool:**
| Route | Type | Purpose | Content minimum (§2.3) |
|---|---|---|---|
| `/` | Home | Tool above the fold (F-01…F-18) + ≥600-word explanatory copy + visible FAQ (12 Qs, §6) | tool + ≥600 words + FAQ |

**Long-tail MPA landing pages (8, exactly the set in `keyword-research.json` →
`landing_pages`).** Each carries: a short intro (150–300 words), the tool
**pre-filled** to the page's duration/word-count (§7 prefill props), a
page-specific **computed table** (below), and 2–3 internal links. Every number on
every landing page is produced by the tool's own §4 formulas at build time (no
scraped data — §5).

> **Thin-content kill rule (R-flag mitigation, binding):** each **per-duration**
> page MUST carry a **distinct computed "words-needed" table across WPM 100→180**
> for *that* duration (F-09 / C4.3), and each **per-word-count** page a distinct
> "time across WPM 100→180" table for *that* count. These tables are numerically
> different on every page (different duration/count ⇒ different rows), so no two
> landing pages share a table. This is the design-doc R=4 thin-content deduction's
> required countermeasure — a landing page without its distinct computed table
> fails G6.

| Route | Target keyword | Prefill (§7) | Distinct computed content |
|---|---|---|---|
| `/how-many-words-is-a-5-minute-speech/` | how many words is a 5 minute speech | `prefillMinutes=5`, mode `words-from-time` | words-needed table, 5 min × WPM 100–180 |
| `/how-many-words-is-a-10-minute-speech/` | how many words is a 10 minute speech | `prefillMinutes=10`, mode `words-from-time` | words-needed table, 10 min × WPM 100–180 |
| `/how-many-words-is-a-3-minute-speech/` | how many words is a 3 minute speech | `prefillMinutes=3`, mode `words-from-time` | words-needed table, 3 min × WPM 100–180 |
| `/how-many-words-is-a-2-minute-speech/` | how many words is a 2 minute speech | `prefillMinutes=2`, mode `words-from-time` | words-needed table, 2 min × WPM 100–180 |
| `/1000-words-to-minutes/` | 1000 words to minutes | `prefillWords=1000`, mode `time-from-words` | time table, 1000 words × WPM 100–180 + silent 238 |
| `/500-words-to-minutes/` | 500 words to minutes | `prefillWords=500`, mode `time-from-words` | time table, 500 words × WPM 100–180 + silent 238 |
| `/average-speaking-rate-words-per-minute/` | average speaking rate words per minute | `prefillWpm=130` (info hub) | cited rate-context table (§4) + tool |
| `/reading-time-calculator/` | reading time calculator | `prefillWpm=130` (reading emphasis is copy/layout-level: the fixed silent-238 output is visually foregrounded on this page) | reading-time table with PINNED rows: **250 / 750 / 1,500 / 2,500 / 4,000 / 6,000 words** × silent 238 + speaking band — deliberately disjoint from the `/1000-` and `/500-words-to-minutes/` tables (thin-content kill rule) |

**Legal / system set (already exist in `site-template/src/pages/`; content
filled, not re-created):** `/privacy`, `/terms`, `/about`, `/contact`, `/404`,
`/500`. Plus generated `robots.txt` (`src/pages/robots.txt.ts`) and
`sitemap-index.xml` (`@astrojs/sitemap`).

**Total launch routes: 1 home + 8 landing + 4 legal + 404 + 500 = 15** (plus
robots/sitemap artifacts).

## 3. Features

Numbered `F-01…F-18`; each independently demonstrable. Core-tool features render
inside the `#tool` section of `/` (replacing the template placeholder) and are
reused, via the shared `SpeechCalc.astro` partial, on landing pages.

- **F-01 Dual input mode.** A mode toggle: **(a) Text** — a `<textarea>` where the
  user pastes/types; word & character counts are derived (F-02/F-03). **(b) Word
  count** — a numeric field where the user enters a word count directly (char
  count is then N/A / hidden). Both modes feed the same time formulas (§4).
  Default mode: **Text**.
- **F-02 Live word count.** Computed per the **exact §4 C4.4 rule** (split on
  Unicode whitespace, collapse runs, trim; empty ⇒ 0). Updates live (F-13).
- **F-03 Live character count.** Two figures: **with spaces** = Unicode
  **code-point** count (`[...text].length`); **without spaces** = code points that
  are not Unicode whitespace (§4 C4.5). Updates live.
- **F-04 WPM slider (100–180).** Range input, min 100, max 180, **step 5**,
  labeled and keyboard-operable. Drives the speaking-time output (F-06). Default
  **130**.
- **F-05 Speed presets — Slow / Average / Fast.** Three `<button>` chips that snap
  the slider and set the active rate: **Slow 110 · Average 130 · Fast 160 WPM**
  (values defined & cited in §4 C4.2). Each labeled with its use case ("deliberate
  delivery" / "typical presentation" / "brisk, energetic"). Selecting a preset
  and dragging the slider are mutually consistent (slider shows the current rate).
- **F-06 Speaking-time output (current rate).** Estimated speaking time at the
  active WPM, formatted per §4 C4.6 (e.g. `4 min 37 sec`; sub-minute ⇒ `37 sec`).
  The headline figure uses the `nums` + `text-gradient` utilities (§7).
- **F-07 Silent-reading-time output.** Estimated silent-reading time at a **fixed,
  cited 238 WPM** (Brysbaert 2019 — §4 C4.2), shown alongside speaking time. Rate
  is labeled with its source on-page (E-E-A-T; beats speechtimecalculator's
  unattributed lock).
- **F-08 Preset comparison mini-panel.** A compact 4-row read-out showing the
  computed time at **Slow 110 / Average 130 / Fast 160** speaking + **Silent 238**
  simultaneously, so the user sees the full spread without moving the slider. All
  four recompute live. *(Grounding: beyond the A5 sketch — a synthesis of research
  wedges #2+#3; explicitly submitted for G2 approval as an extension.)*
- **F-09 Words-from-duration (inverse) mode.** A "I have a time limit" toggle
  switches the tool to **words-from-time**: given a target duration (minutes), it
  outputs the **words needed across WPM 100→180** as a table (§4 C4.3). This mode
  powers the per-duration landing pages (prefilled via F-18).
- **F-10 Huge-paste cap (200,000 chars).** If pasted/typed text exceeds **200,000
  code points**, the input is truncated to 200,000 and a **non-blocking** notice
  ("Text capped at 200,000 characters for performance") appears via `aria-live`;
  counts/times are computed on the capped text. No freeze, no crash.
- **F-11 Empty / whitespace / zero / invalid-numeric handling — ALL numeric
  fields.** Empty text, whitespace-only text, or word-count input of 0/empty ⇒
  **0 words**, **0 characters**, speaking & reading times render **`0 sec`**
  (exactly — this string is the §10 oracle), and **no `NaN`/`Infinity` is ever
  displayed**. Numeric fields (word count, target minutes): **negative values are
  rejected** with an inline `aria-invalid` error ("Enter a positive number");
  **decimal target minutes are accepted** (e.g. `7.5` ⇒ `W = round(R × 7.5)`);
  target minutes `0`/empty ⇒ a 0-words table row set (no error); absurdly large
  values compute normally (no cap on numerics; only text is capped, F-10).
- **F-12 Unicode-aware counting.** Word splitting uses Unicode whitespace
  (`/\s+/u`, which includes NBSP `U+00A0`, `U+2028`, `U+3000`, etc.); character
  counting uses code points (astral chars such as emoji count as 1, not 2).
  Documented limitation: scripts without inter-word spaces (CJK, Thai) are
  undercounted by whitespace tokenization — multi-language WPM tables are **out of
  scope** (§9).
- **F-13 Live recalculation (no submit button).** All outputs recompute on every
  `input`/`change` event. No page reload, no form submit.
- **F-14 In-browser privacy.** All processing is client-side; text is **never
  uploaded and never persisted** to storage. An on-page note states this (trust
  wedge, per Debatrix). Only preferences (F-15), never text, touch `localStorage`.
- **F-15 Preference persistence.** The chosen **WPM** and **input mode** persist
  across reloads under a namespaced key (`slc:prefs`), read on init inside a
  `try/catch` (private-mode safe); absent/blocked storage falls back to defaults
  (Text mode, 130 WPM). **Pasted text is deliberately NOT persisted** (F-14).
  *(Grounding: beyond the A5 sketch — site-1 F-10 persistence precedent applied;
  explicitly submitted for G2 approval as an extension.)*
- **F-16 Live word/char counters visible in Text mode** as instrument-style
  read-outs (`nums`), updating on each keystroke without layout shift.
- **F-17 Mobile-first responsive single-page layout.** The whole tool + outputs +
  any table are usable on a 375px viewport without horizontal scroll (tables
  scroll inside their own `overflow-x:auto` container, F-13 style). Uses the
  v0.2.0 design utilities (§7): `glass` tool card, `nums` outputs, `btn-accent`
  primary action, `text-gradient` headline figure, tokenized focus rings.
- **F-18 Prefill props for landing pages.** `SpeechCalc.astro` accepts
  `prefillText?`, `prefillWords?`, `prefillWpm?` (default 130; **clamped to the
  F-04 slider bounds [100, 180]**), `prefillMinutes?`,
  and `mode?` (`"time-from-words"` | `"words-from-time"`). Duration pages pass
  `prefillMinutes` + `mode="words-from-time"`; word-count pages pass `prefillWords`
  + `mode="time-from-words"`. Props set initial state only; the tool is fully
  interactive thereafter.

## 4. Formulas & data sources (cited)

All outputs are pure deterministic arithmetic over user input plus published rate
constants — **no external dataset** (§5). Let `W` = word count, `R` = speaking
rate in words per minute, `M` = duration in minutes.

**C4.1 — Speaking / reading time from words.**
`minutes = W / R`  (an arithmetic identity: rate is words-per-minute, so
time = words ÷ rate). Applied with `R` = the active speaking WPM for speaking
time, and `R` = 238 for silent-reading time (C4.2).
*Source:* definitional (unit identity); not an estimate.

**C4.2 — Rate constants (the presets & the reading rate) — cited.**

| Constant | Value | Basis (verified 2026-07-15) |
|---|---|---|
| **Silent reading** | **238 WPM** | **Brysbaert, M. (2019),** *"How many words do we read per minute? A review and meta-analysis of reading rate,"* **Journal of Memory and Language, vol. 109.** Meta-analysis of **190 studies / 18,573 participants**: mean silent reading = **238 wpm (non-fiction)**, 260 wpm (fiction). We use the non-fiction figure (conservative, general-purpose). This is a *published measured mean*, not an estimate. |
| **Average speaking (default)** | **130 WPM** | Presentation-delivery pace. Verified band: **presentations run 100–150 wpm** and **conversation ≈150 wpm** per the **National Center for Voice and Speech (NCVS)**, cited by VirtualSpeech ("average conversation rate … about 150 wpm") and Baruch College TFCS. A *prepared speech is delivered slower than conversation* (speakers pause for emphasis), so 130 wpm — the mid-low of the 100–150 presentation band — is the defensible single "average," matching wordstotime.com's average preset (timemywords.com also offers 130 among its 100/130/160/180 preset set). |
| **Slow speaking** | **110 WPM** | Deliberate/emphatic delivery — bottom of the presentation band (VirtualSpeech: presentations 100–150 wpm; Baruch's slower intelligible example ≈120 wpm). Matches the **speech-coaching** incumbent Debatrix's slow preset (110), the strongest-E-E-A-T tool in the SERP. |
| **Fast speaking** | **160 WPM** | Brisk, energetic delivery — top of the conversational/audiobook band (VirtualSpeech: audiobooks/podcasts 150–160 wpm), below the **≈173 wpm average of VirtualSpeech's analysis of five popular TED talks (range 154–201)**. Matches wordstotime.com's fast preset (timemywords.com also offers 160 among its presets). |

**Honesty note (§7.1.3):** the *ranges* above are cited and verified; the three
**specific preset picks (110/130/160) are a reasoned selection within those cited
ranges**, not a claim that "the speaking rate is exactly X." The **100–180 WPM
slider (F-04) is the deliberate mitigation** — any user whose pace differs sets
their own rate. The presets are therefore convenience anchors, not asserted
facts, and are **not** tagged `[ESTIMATE]` because each sits inside a
source-verified band and is user-overridable. **238 is a cited measured mean** and
likewise not an estimate. No `[ESTIMATE]` values appear in this tool's math.

**C4.3 — Words needed for a target duration (inverse).**
`W = round(R · M)` (round half-up to a whole word). Used for the words-from-time
mode (F-09) and the per-duration landing tables. For whole `R` and whole `M` the
product is an exact integer (no rounding needed).
*Source:* algebraic inverse of C4.1.

**C4.4 — Word-count rule (defines every word/time oracle — binding, exact).**
Given the raw input string `s`:
1. Apply the 200,000-code-point cap (C4.7) first.
2. `trimmed = s.trim()` (strips leading/trailing Unicode whitespace).
3. If `trimmed === ""` ⇒ **word count = 0**.
4. Else **word count = `trimmed.split(/\s+/u).length`** — split on **runs of one
   or more Unicode whitespace characters**. `/\s/u` in JS matches
   ` \t\n\r\f\v`, NBSP `U+00A0`, `U+1680`, `U+2000–200A`, `U+2028`, `U+2029`,
   `U+202F`, `U+205F`, `U+3000`, and `U+FEFF`. Because `trimmed` has no leading/
   trailing whitespace, the split yields no empty tokens; a defensive
   `.filter(Boolean)` is permitted but must not change any count.
*Source:* definitional tokenization rule for this tool (stated so the G4 oracle is
unambiguous). Hyphens, apostrophes, and periods do **not** split words
("well-known", "don't", "e.g." are each one word).

**C4.5 — Character-count rule.**
`chars_with_spaces = [...s].length` (Unicode **code points**, so an astral
character such as `😀` U+1F600 counts as **1**, not 2 as `s.length` UTF-16 would
give). `chars_no_spaces = [...s].filter(c => !/\s/u.test(c)).length`.
*Source:* definitional; code-point counting chosen for cross-emoji correctness.
Known simplification: ZWJ emoji sequences and combining-mark sequences count per
code point, not per grapheme (acceptable for a word-timing tool; graphemes are
out of scope).

**C4.6 — Time-formatting rule (binding, exact).**
Given `minutes = W / R`:
1. `totalSeconds = floor(minutes · 60 + 0.5)` — **round half-up** to a whole
   second. (Equivalent to `Math.round` for these strictly non-negative values;
   `floor(x+0.5)` is stated to pin the half-up tie direction.)
2. `mm = floor(totalSeconds / 60)`, `ss = totalSeconds − mm·60`.
3. Render: if `mm ≥ 1` ⇒ **`"{mm} min {ss} sec"`** (e.g. `4 min 37 sec`,
   `5 min 0 sec`); if `mm === 0` ⇒ **`"{ss} sec"`** (e.g. `37 sec`, `0 sec`).
*Source:* definitional display rule.

**C4.7 — Input cap.** If `[...s].length > 200000`, truncate to the first
**200,000 code points** before C4.4/C4.5 and raise the F-10 notice. `s.length`
(UTF-16) is **not** used for the cap, to avoid splitting an astral char.
*Source:* design-doc §2.2 A5 ("huge paste (cap 200k chars)").

**Rate-context table (for `/average-speaking-rate-words-per-minute/`)** — all
figures cited to NCVS / VirtualSpeech / Baruch TFCS / Brysbaert 2019 as above:
conversation ≈150 wpm; presentation 100–150 wpm; audiobook/podcast 150–160 wpm;
≈173 wpm avg of VirtualSpeech's five analyzed popular TED talks (range 154–201); silent reading 238 wpm (non-fiction). Presented as
context, with the tool's presets mapped onto it.

## 5. Dataset schema

**None (computed).** This is the correct, deliberate answer, not an omission.

Every number the tool and every landing page displays is **generated at
build/run time by the §4 formulas** from the user's input and the cited rate
constants (C4.2). No manufacturer specs, competitor tables, or external files are
copied — so there is **no dataset to fetch, schema, or attribute**, and no
`source`/`retrieved` provenance fields are required (design-doc §7.2 "external
data" tree: the data is *derivable*, so it is derived — never fabricated, never
scraped). The §13.7 per-datum sourcing obligation applies only to fetched
datasets (e.g. `phones.json` on a different site) and does not apply here.

The only hard-coded constants are the **rate values** (110 / 130 / 160 / 238 WPM),
which are **cited in §4 C4.2**, listed inline in the calc module — not a data
file. The per-duration and per-word-count landing tables are arrays computed by
iterating WPM 100→180 step 10 through C4.1 / C4.3 at build time.

## 6. Keyword map

Main keyword and the supporting keywords are taken from
`research/speechlengthcalculator/keyword-research.json` (`main_keyword`,
`supporting_keywords[]`, `questions[]`, `landing_pages[]`). Volume figures are all
`[ESTIMATE]` pending the G1 Ahrefs capture [HUMAN] — the map's *structure* is
fixed here; the operator confirms the head-term volume at G1 and may pivot the
home `<title>` emphasis then (site-1 precedent).

**Main:** `words to minutes` (cluster head; exact `.com` wordstominutes.com is
TAKEN, so our domain is keyword+modifier) → **`/` (home)**. `<title>` and primary
copy target both `words to minutes` and the exact-match `speech length
calculator`; **H1 stays "Speech Length Calculator"** (site name / domain
identity). Body copy uses "words to minutes" and "convert words to minutes /
speaking time" naturally.

| # | Supporting keyword (G1 artifact) | Target page |
|---|---|---|
| 1 | speech length calculator (exact-match domain) | `/` (home, primary H1) |
| 2 | speech time calculator | `/` (home, secondary H2) |
| 3 | words to time | `/` (home) |
| 4 | speaking time calculator | `/` (home) |
| 5 | words to minutes converter | `/` (home, converter copy section) |
| 6 | words per minute calculator / speech | `/average-speaking-rate-words-per-minute/` |
| 7 | average speaking rate words per minute | `/average-speaking-rate-words-per-minute/` |
| 8 | how many words is a 5 minute speech | `/how-many-words-is-a-5-minute-speech/` + home FAQ Q1 |
| 9 | how many words is a 10 minute speech | `/how-many-words-is-a-10-minute-speech/` + FAQ Q3 |
| 10 | how many words is a 3 minute speech | `/how-many-words-is-a-3-minute-speech/` + FAQ Q4 |
| 11 | how many words is a 2 minute speech † | `/how-many-words-is-a-2-minute-speech/` |
| 12 | 1000 words to minutes / how long to read 1000 words | `/1000-words-to-minutes/` + FAQ Q7 |
| 13 | 500 words to minutes † | `/500-words-to-minutes/` |
| 14 | reading time calculator | `/reading-time-calculator/` |
| 15 | how many pages is a 5 minute speech | home FAQ Q2 (textual; pages depend on formatting — noted as estimate) |
| 16 | script timer / words to minutes for video scripts | `/average-speaking-rate-words-per-minute/` audience note + FAQ Q11. **No dedicated per-audience page in v1** (§9). |

† Rows 11 and 13 are sourced from the G1 artifact's `landing_pages[]` array
(not `supporting_keywords[]`, which the intro cites for the other rows).

**Per-page `<Seo>` intent** (P5/P6 fills exact strings; ≤60-char title, ≤160-char
description, each containing its target keyword; canonical absolute from
`Astro.site`).

**FAQ content (home) — the 12 questions adapted (hyphenation/case normalized)
from `keyword-research.json` → `questions[]`.** FAQ is **visible content only**, no `FAQPage` JSON-LD (design-doc
D-10). Where marked **[from tool math]**, the numeric answer MUST be produced by
§4 formulas (and therefore agrees with §10), never asserted from memory:

1. *How many words is a 5-minute speech?* → **[from tool math]** ~**650 words** at
   the 130 wpm average (range 550 @110 slow – 800 @160 fast; 500 @100 – 900 @180
   across the full slider). Link `/how-many-words-is-a-5-minute-speech/`.
2. *How many pages should my 5-minute speech be?* → ~2–2.5 double-spaced pages
   (~250–300 words/page); note page count depends on font/spacing — framed as an
   estimate, not tool math. Link the 5-minute page.
3. *How many words do I need for a ten-minute speech?* → **[from tool math]**
   ~**1,300 words** @130 (1,000 @100 – 1,800 @180). Link
   `/how-many-words-is-a-10-minute-speech/`.
4. *How many words are in a 3-minute speech?* → **[from tool math]** ~**390 words**
   @130 (330 @110 – 480 @160). Link `/how-many-words-is-a-3-minute-speech/`.
5. *How many words per minute in a speech?* → cite NCVS ≈150 wpm conversational /
   100–150 presentation (§4 C4.2); explain our 110/130/160 presets.
6. *What is the ideal rate of speech (WPM) for a presentation?* → 100–150 wpm
   (VirtualSpeech/NCVS); slower aids comprehension; point to the slider.
7. *How long does it take to read 1000 words (silently vs aloud)?* → **[from tool
   math]** silent **4 min 12 sec** (238 wpm); aloud ~**7 min 42 sec** @130. Link
   `/1000-words-to-minutes/` and `/reading-time-calculator/`.
8. *How many words can you say in 10 minutes?* → **[from tool math]** ~1,300 @130
   (1,000–1,800 across the slider). Link the 10-minute page.
9. *How many slides do you need for a 10-minute presentation?* → rule-of-thumb
   ~1 slide/minute (≈10), framed as guidance, not tool math; slides are out of
   scope (§9).
10. *How long does it take to write a 5-minute speech?* → qualitative writing-time
    guidance; explicitly not a tool output.
11. *What is an average speaking rate for audiobook narration?* → 150–160 wpm
    (VirtualSpeech); note it differs from live-speech pacing.
12. *Is 160 words per minute too fast for a speech?* → 160 is our "fast" preset —
    brisk but intelligible (below the ≈173 wpm average of five analyzed popular TED talks); recommend slowing for
    complex material. Point to the slider.

## 7. Island/hydration plan

**Decision: a single vanilla `<script>` island. No React. No `@astrojs/react`, no
shadcn.** Justified explicitly against design-doc §7.2 decision tree:

- *Does this component need client JS?* Yes — live counting, slider/preset
  recompute, mode toggle, localStorage.
- *Is it the core tool?* Yes → the tree permits "one React island `client:load`
  **or vanilla `<script>` if trivial**." This tool **is** trivial by that test:
  its entire state is a handful of primitives (input string *or* word-count
  number, mode, WPM, target-minutes); its logic is ~50 lines of arithmetic and
  string counting (§4); it renders into a fixed DOM skeleton already present in
  the Astro page. **No component tree, no shared React context, no async,
  no virtualization** — nothing React buys. Adding React + shadcn would pull a
  hydration runtime and the tsconfig-alias/init ceremony onto a page that
  otherwise ships **zero framework JS**, directly helping the LHCI perf ≥0.90 gate
  (G5) and TBT/LCP.
- *Below fold / shares context?* N/A — one island, one context boundary.

**Implementation shape:** interactive markup lives in a shared
`src/components/SpeechCalc.astro` partial (imported by `index.astro` and every
landing page) with native controls only — `<textarea>`, `<input type="number">`,
`<input type="range">` (the slider), `<button>` preset chips, and a mode toggle.
A co-located `<script type="module">` (runs on load; the tool is above the fold so
no `client:*` directive concept applies to a raw Astro `<script>`) wires
`input`/`change` listeners, calls the §4 functions from a **first-party calc
module** (`src/lib/speech.ts` — `countWords`, `countChars`, `speakingTime`,
`wordsForDuration`, `formatTime`), writes results into `aria-live` output nodes,
and reads/writes `localStorage`. The partial reads its **prefill props** (F-18) to
set initial `value`/`selected`/mode. The per-duration and per-word-count landing
**tables are pre-rendered server-side** in Astro by importing the same calc module
at build time (present in static HTML for SEO, need no hydration); the live tool
updates its own outputs on top. **No new runtime dependency is added** (§4.6 rule)
— the calc module is first-party.

## 8. A11y notes

Target: axe 0 critical/serious (G5); keyboard-only operable (P-08); WCAG AA
contrast from `docs/design-spec.md` v0.2.0 tokens (no ad-hoc colors, §7.1). The
accent (indigo→violet) carries text at AA; cyan is decorative only (per
`global.css` note).

- **Labels:** every control has an associated `<label for>` — the textarea, the
  word-count number field, the WPM slider, the target-minutes field, and the mode
  toggle. Preset chips are real `<button>`s with descriptive text (e.g. "Set speed
  to Average, 130 words per minute"), not click-only `<div>`s.
- **Slider (F-04):** native `<input type="range">` — operable by arrow keys, Home/
  End, PageUp/Down; `aria-valuetext` announces "130 words per minute" (not the
  bare number) so the value is meaningful to screen readers.
- **Keyboard:** all controls reachable/operable by Tab / Shift-Tab / Enter / Space
  / arrows (native controls only — a consequence of the §7 no-custom-widget
  choice). Visible focus ring from design tokens (`global.css` `:focus-visible`);
  logical top-to-bottom DOM/tab order.
- **Live outputs:** the results region (speaking time, silent-reading time, preset
  panel, word/char counts) is `aria-live="polite"` so recomputed values are
  announced on change (F-13) without stealing focus. The F-10 cap notice and any
  input warning go to an `aria-live="assertive"` / `role="alert"` node.
- **Counts & meaning:** word/char read-outs use `<output>` elements associated
  with their inputs; numbers use the `nums` (tabular) utility so they don't reflow.
- **Tables (landing pages & preset panel):** real `<table>` with `<caption>` and
  `<th scope>`; wrapped in an `overflow-x:auto` region with an accessible label so
  keyboard users can scroll on narrow viewports (F-17).
- **Contrast & signalling:** all text/UI meets WCAG AA (≥4.5:1 body, ≥3:1 large/
  UI) using reviewed tokens (light + dark); errors/warnings use text + `aria`, not
  color alone. Respects `prefers-reduced-motion` (tokens already do).

## 9. Out of scope

Explicitly excluded from v1 to prevent scope invention during build (§7.1 rule 6).
Each is a deliberate v2 candidate or a hard exclusion:

- **Audio recording / TTS playback** (read-my-speech-aloud, record-and-time).
  **v2 candidate.** v1 is estimate-only.
- **Teleprompter / practice mode** (scroll the text at the chosen WPM, "practice &
  measure" à la timemywords' vapor feature). **v2 candidate.**
- **File upload** (.docx/.txt/.pdf import for word count). Excluded — paste covers
  the need; upload adds parsing deps and a privacy surface (F-14). **v2 candidate.**
- **Multi-language / per-language WPM tables** (CJK/Thai accurate word counting,
  localized reading rates). Excluded — the §4 C4.4 whitespace rule undercounts
  space-less scripts; documented as a known limitation. **v2 candidate.**
- **Per-audience speaking rates** (separate presets for audiobook / podcast /
  auctioneer / debate). Excluded — the slider (F-04) covers arbitrary rates; the
  rate-context table is informational only. **v2 candidate.**
- **"Time yourself reading" speed calibration** (howlongismyspeech.com's
  differentiator). Excluded from v1 (adds timing UI + state). **v2 candidate**,
  flagged in `research-notes.md` as the feature to steal next.
- **Adjustable silent-reading rate.** v1 locks silent reading at the cited 238 wpm
  (C4.2). A slow/avg/fast reading toggle is a **v2 candidate**.
- **Save / export / share / copy-link of a result.** Excluded from v1.
- **Pages-count and slides-count calculators** (FAQ Q2/Q9 answered textually as
  estimates only; both depend on formatting/design conventions, not word math).
- **No `FAQPage` / rating / review JSON-LD** (design-doc D-10, §13.4) — FAQ stays
  visible content; `WebApplication` + `BreadcrumbList` + `Organization` schema
  only, no `aggregateRating`/`review` fields.
- **No React/shadcn, no runtime deps beyond §5 stack** (§7 decision).

## 10. Acceptance checklist

Per formula-bearing feature: **3 exact input→output pairs, computed and
TRIPLE-CHECKED by hand** (the G4 test oracle; §7.3). Arithmetic shown in a
`<!-- … -->` comment for every non-trivial pair. Time format = §4 C4.6; rounding
= half-up seconds. Commit refs filled at G4.

**F-02 — Word count** — split on Unicode whitespace, collapse runs, trim (C4.4)
- [ ] `"Hello world"` → **2 words**
- [ ] `"  The   quick brown\tfox\njumps  "` → **5 words**
  <!-- trim strips outer spaces; split on runs of space/tab/newline → The,quick,brown,fox,jumps = 5 -->
- [ ] `"well-known café, don't"` → **3 words**
  <!-- hyphen/apostrophe/comma do NOT split; tokens: "well-known" | "café," | "don't" = 3 -->
- [ ] edge: `""` → **0**; `"   \t\n "` → **0** (trim ⇒ empty ⇒ 0, no empty token counted)
- [ ] edge (Unicode ws): `"one two three"` (NBSP between one/two) → **3 words**
  <!-- /\s+/u matches NBSP U+00A0, so split → one,two,three = 3 -->

**F-03 — Character count** — code points; with-spaces and no-spaces (C4.5)
- [ ] `"Hello world"` → **11 with spaces / 10 without**
  <!-- 11 code points incl. the space; minus 1 whitespace = 10 -->
- [ ] `"café"` (precomposed é, U+00E9) → **4 / 4**
- [ ] `"hi 😀"` → **4 with spaces / 3 without**
  <!-- code points: h,i,space,😀(U+1F600=1) = 4; string.length(UTF-16) would wrongly give 5 -->

**F-06 — Speaking time from words** — `minutes = W/R`, format C4.6
- [ ] **650 words @ 130 wpm → `5 min 0 sec`**  <!-- 650/130 = 5.000 min; ×60 = 300 s; 300 = 5·60+0 -->
- [ ] 1000 words @ 130 wpm → **`7 min 42 sec`**
  <!-- 1000/130 = 7.692307… min; ×60 = 461.5384… s; round half-up → 462 s; 462 = 7·60+42 -->
- [ ] 400 words @ 160 wpm → **`2 min 30 sec`**  <!-- 400/160 = 2.5 min; ×60 = 150 s; 150 = 2·60+30 -->

**F-06 (formatting & half-up rounding)** — sub-minute path + exact .5 tie
- [ ] 7 words @ 120 wpm → **`4 sec`**
  <!-- 7/120 = 0.0583333 min; ×60 = 3.5 s exactly; floor(3.5+0.5)=4 → sub-minute format "4 sec" -->
- [ ] 20 words @ 130 wpm → **`9 sec`**
  <!-- 20/130 = 0.153846 min; ×60 = 9.2307 s; round → 9; mm=0 ⇒ "9 sec" -->
- [ ] 0 words (any rate) → **`0 sec`** (empty path, no NaN — ties to F-11)

**F-07 — Silent-reading time** — `minutes = W/238` (Brysbaert 2019), format C4.6
- [ ] 238 words → **`1 min 0 sec`**  <!-- 238/238 = 1.000 min; ×60 = 60 s; 60 = 1·60+0 -->
- [ ] 1000 words → **`4 min 12 sec`**
  <!-- 1000/238 = 4.201680… min; ×60 = 252.1008… s; round → 252 s; 252 = 4·60+12 -->
- [ ] 500 words → **`2 min 6 sec`**
  <!-- 500/238 = 2.100840… min; ×60 = 126.0504… s; round → 126 s; 126 = 2·60+6 -->

**F-08 — Preset comparison panel** — same C4.1 at all four rates, single input
- [ ] 650 words → Slow110 **`5 min 55 sec`** · Avg130 **`5 min 0 sec`** · Fast160 **`4 min 4 sec`** · Silent238 **`2 min 44 sec`**
  <!-- 650/110=5.9090min×60=354.54→355s=5:55 | 650/130=300s=5:00 | 650/160=3.90625min×60=243.75→244s=4:04 | 650/238=2.7310min×60=163.86→164s=2:44 -->
- [ ] 300 words → Slow110 **`2 min 44 sec`** · Avg130 **`2 min 18 sec`** · Fast160 **`1 min 53 sec`** · Silent238 **`1 min 16 sec`**
  <!-- 300/110=163.63→164s=2:44 | 300/130=138.46→138s=2:18 | 300/160=112.5→113s=1:53 | 300/238=75.63→76s=1:16 -->
- [ ] 1000 words → Slow110 **`9 min 5 sec`** · Avg130 **`7 min 42 sec`** · Fast160 **`6 min 15 sec`** · Silent238 **`4 min 12 sec`**
  <!-- 1000/110=545.45→545s=9:05 | 1000/130=462s=7:42 | 1000/160=375s=6:15 | 1000/238=252s=4:12 -->

**F-09 — Words for a target duration** — `W = round(R·M)` (C4.3), landing tables
- [ ] 5 min @ 130 wpm → **650 words**  <!-- 130·5 = 650 exact -->
- [ ] 10 min @ 100 wpm → **1000 words**  <!-- 100·10 = 1000 exact (first row of the 10-min table) -->
- [ ] 3 min @ 160 wpm → **480 words**  <!-- 160·3 = 480 exact -->
- [ ] table spot-check `/how-many-words-is-a-5-minute-speech/` row set (WPM 100→180 step 10):
      **500 · 550 · 600 · 650 · 700 · 750 · 800 · 850 · 900**  <!-- W = WPM·5 -->

**F-10 — Huge-paste cap (200,000 code points, C4.7)**
- [ ] exactly 200,000 chars pasted → accepted, counted, **no** cap notice (200000 is not > 200000)
- [ ] 200,001 chars pasted → truncated to 200,000, cap notice shown, counts/times computed on 200,000
- [ ] a string containing astral chars is capped by **code points** (`[...s].length`), never split mid-char

**F-11 — Empty / whitespace / zero (no NaN/Infinity)**
- [ ] Text mode, input `""` → 0 words, 0 chars, speaking **`0 sec`**, silent **`0 sec`** (no `NaN`)
- [ ] Text mode, input `"     "` (spaces only) → **0 words** (trim ⇒ 0)
- [ ] Word-count mode, value `0` or empty → **0 words**, times **`0 sec`**, no `Infinity`/`NaN` displayed

**F-11 — Numeric-field validation (all numeric inputs; added per G2 review D-2)**
- [ ] Word-count mode, value `-250` → rejected: inline error **"Enter a positive number"**, `aria-invalid="true"`, no output change
- [ ] Words-from-time mode, minutes `-5` → rejected: same error string + `aria-invalid`, table unchanged
- [ ] Words-from-time mode, minutes `7.5` @ slider 130 → **975 words** <!-- W = round(130 × 7.5) = round(975.0) = 975 -->
- [ ] Words-from-time mode, minutes `0` → 0-words rows across the table, **no error** (valid degenerate case)

**F-13 — Live recalculation**
- [ ] paste changing word count 650→1000 @130 → speaking time updates `5 min 0 sec`→`7 min 42 sec`, no submit/reload
- [ ] drag slider 130→160 at 650 words → speaking time updates `5 min 0 sec`→`4 min 4 sec` live
- [ ] click **Fast** preset at 650 words → slider snaps to 160, time shows `4 min 4 sec` live

**F-15 — Preference persistence**
- [ ] set WPM = 160, reload → slider still 160 (`slc:prefs`)
- [ ] set mode = Word count, reload → still Word-count mode
- [ ] localStorage blocked/private mode → tool loads with defaults (Text, 130 wpm), no crash; **pasted text never restored** (F-14)

---
*All numeric outputs above were computed to full precision from §4 formulas and
formatted per C4.6; they are the binding oracle for the G4 unit tests (≥3 known
I/O pairs per formula, §8 P4 / §7.3). Landing-page tables (F-09) are generated by
the same calc module at build time, so they cannot drift from this oracle.*
