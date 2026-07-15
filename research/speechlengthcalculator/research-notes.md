# P1 Research Notes — Speech Length Calculator (speechlengthcalculator.com) — Site #2

Date: 2026-07-15. Evidence: WebSearch (5 head queries + 6 supporting queries) + WebFetch of 5 competitor tools + RDAP check. Companion artifacts: `serp-analysis.json`, `keyword-research.json`.

## The winning wedge

No observed top-10 competitor offers, on one page:

1. **Both input modes** (paste text AND raw word-count number) — wordstotime.com and timemywords.com have both; Debatrix and howlongismyspeech.com are paste-only.
2. **A 100–180 WPM slider AND slow/avg/fast presets** — speechtimecalculator.com is the ONLY incumbent with a slider (default 183); every other tool has 3–4 fixed presets. Nobody has slider + labeled presets together.
3. **Speaking time AND silent reading time side by side** — only wordstotime.com (toggle, not side-by-side) and speechtimecalculator.com (reading speed locked at 238 wpm) cover both intents.
4. **Live word count + character count** — only howlongismyspeech.com and speechtimecalculator.com show char counts.
5. **A per-duration landing-page cluster** — NO dedicated-tool incumbent has any (`/how-many-words-is-a-5-minute-speech/` class queries are held entirely by blogs: wordcounter.io/.net, SEEK, Indeed, Quora, capitalizemytitle). This is the biggest structural gap: the question queries have proven decade-long demand (wordcounter.net's post dates to 2016) and are answered today by static articles with no calculator on the page.

The planned spec (§2.2 row A5: paste OR word count → 100–180 WPM slider + presets + silent reading time + live word/char count + duration landing pages) covers all five gaps by construction. Secondary differentiator worth stealing later: howlongismyspeech.com's "time yourself reading a sample paragraph → use my speed" calibration (unique in the niche, single-feature site otherwise).

## Risks

- **Active farming / SERP churn**: wordstominutes.com and howlongismyspeech.com registered mid-2026 (portfolio RDAP sweep); speakingtimecalculator exists as .com AND .org; three wordstotime variants live (.com/.app/.netlify.app). Many adequate new entrants → differentiation must be real, and rankings may be volatile. This is why C is scored conservatively.
- **Two competent young incumbents**: timemywords.com (modern UI, FAQ, tables) and speechtimecalculator.com (slider, research citations, char counts) are NOT weak/ugly — each covers ~3 of the 5 wedge features.
- **Low CPM**: generic-utility ad category (plan doc's own A5 rating: "Low"). Students/speakers/podcasters audience; essay-service advertisers exist but pay modestly.
- **Thin-content/duplicate AdSense risk**: dozens of near-identical converters exist; another one with thin copy risks being classed as duplicate utility. Mitigation is binding: ≥600-word home copy + 8 landing pages + visible FAQ (§2.3), but the risk is structurally higher than site #1's, hence R deduction below.
- **Seasonality**: speech/essay demand tracks the school year (US); expect a summer trough [ESTIMATE — verify in GSC post-launch].
- **Domain/keyword mismatch**: the head term's exact .com (wordstominutes.com) is taken; our domain is exact only for the lower-volume "speech length calculator".

## Recommended scores (§2.1 rubric)

| Dim | Score | One-line justification |
|-----|-------|------------------------|
| C | **3** (rubric-literal; conservative first pass = 2, recorded in serp-analysis.json) | Two-pass per P-01: 0-bucket fails (no regex101-class incumbent; biggest brand voices.com holds one basic utility page), 5-bucket fails (no forums/gov in top-10); 3-bucket fits — #2 incumbent serves an **expired TLS cert**, #1 has no custom speed/FAQ + affiliate clutter, and 4 of 10 slots are SaaS lead-gen template pages; capped at 3 because timemywords + speechtimecalculator are competent and the niche is being actively farmed. |
| D | **3** | speechlengthcalculator.com is keyword+modifier for main keyword "words to minutes" (exact .com taken) and exact-match only for the secondary term "speech length calculator"; RDAP 404 re-verified 2026-07-15; fresh .com ⇒ standard pricing expected, D-11 checkout screenshot still required at G1 [HUMAN]. |
| M | **2** | Generic-utility CPM tier (1–2), taken at the top of the band: essay/edtech advertisers demonstrably spend here (four essay brands run lead-gen converters), general audience so no dev-adblock deduction; plan doc itself rates A5 CPM "Low". |
| B | **5** | Pure client-side text math (word split + division), no dataset, no sensors — the plan doc calls A5 the portfolio's easiest build. |
| R | **4** | No YMYL, no data-accuracy liability (estimates framed as estimates); −1 for thin-content/duplicate risk in a niche saturated with near-identical converters (mitigated by 600-word copy + 8 landing pages, not eliminated). |

**Total = 2C + 1.5D + 1.5M + B + R = 6 + 4.5 + 3 + 5 + 4 = 22.5 → Build (≥ 22)** — but only 0.5 above the threshold, and it Parks (20.5) if the conservative C=2 stands. Decision hinges on the C two-pass, exactly as it did for site #1 (same precedent: serp-analysis carried 2, scorecard finalized 3). Operator judgment + the G1 Ahrefs volume capture [HUMAN] should settle it; a "words to minutes" volume print ≥ the 1,000 US/mo floor makes the rubric-literal C=3 safe to accept.

## Aggregate cluster volume picture (all [ESTIMATE] — Ahrefs capture pending at G1)

- Head: **"words to minutes" 10k–25k US/mo [ESTIMATE]** — densest tool-only SERP of the five head queries tested; 15+ purpose-built competitor pages including paid-acquisition essay/SaaS brands that only build lead-gen tools above meaningful volume.
- Tool variants: "speech time calculator", "words to time", "words to minutes converter", "speaking time calculator" — **low thousands US/mo each [ESTIMATE]** (each has ≥2 exact-match dedicated domains or ≥4 branded tool pages competing).
- "speech length calculator" (our exact-match): **hundreds–low thousands US/mo [ESTIMATE]** — calculator.academy + a mid-2026-registered exact-match rival both target it.
- Per-duration questions (2/3/5/10-minute × words/pages): **long tail, 5-minute variant strongest [ESTIMATE]** — blog-held since 2016, two programmatic series incumbents, zero tool-first pages.
- Adjacent: "reading time calculator" **10k+ US/mo [ESTIMATE]** — separate crowded SERP, reachable with the same engine (wordstotime.com ranks in both).
- **Cluster total: 30k–60k US/mo US [ESTIMATE]** — comfortably above the 1,000/mo floor on any plausible reading of the observed signals, but the floor must still be evidenced by the Ahrefs artifact at G1 per §2.1 data-source rules.

## Observed-evidence log (what was actually fetched vs searched)

- WebFetch OK: wordstotime.com, timemywords.com, speechtimecalculator.com/en, debatrix.com/en/speech-calculator/, howlongismyspeech.com.
- WebFetch FAILED (finding, not gap): speechinminutes.com → "certificate has expired" (2026-07-15).
- WebSearch queries: "words to minutes", "speech time calculator", "speech length calculator", "how long is a 5 minute speech", "words to minutes converter", "how many words is a 5 minute speech", "how many words is a 10 minute speech", "how many words is a 3 minute speech", "1000 words to minutes how long to read", "average words per minute speaking rate", "reading time calculator", "speech calculator words per minute presentation".
- RDAP: speechlengthcalculator.com → HTTP 404 (available), 2026-07-15, via rdap.verisign.com.
