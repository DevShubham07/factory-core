# 0008 - Indexing via Sitemaps API + IndexNow; Google Indexing API prohibited

## Status
accepted

## Context
The Google Indexing API is officially restricted to JobPosting and
BroadcastEvent-embedded-in-VideoObject content; using it for ordinary tool
pages is detectable misuse and can be penalized under Google's spam
policies (research correction C-05). None of the factory's sites qualify
for legitimate use of that API.

## Decision
Compliant acceleration path only: Sitemaps API submission (`gsc-submit.mjs`)
plus internal linking for Google; IndexNow (`indexnow.mjs`, POST to
`api.indexnow.org`) for Bing/Yandex/Seznam/Naver, since Google does not
support IndexNow. The Google Indexing API is a hard prohibition — any
future "instant indexing" tool suggestion for these sites is rejected on
sight (§13.2).

## Consequences
- Gate G9 checks GSC sitemap status = "Success", IndexNow 200/202 logged,
  and a live Bing Webmaster property — never an Indexing API call.
- URL Inspection quota (2,000/day/site) and IndexNow's 10k-URLs/POST cap
  are non-binding at this fleet's scale (§14.2).
- Indexing speed for Google specifically depends on sitemap freshness and
  internal linking quality, not push APIs — content/SEO quality (P5/P6)
  is the actual lever.
