# RB-02 - Domain / DNS incident

## Trigger
The custom domain is unreachable, resolves incorrectly, or fails TLS —
detected via Better Stack uptime alert (email/phone — site DOWN = act now)
or the weekly `audit.yml` HTTP-200-both-hosts check.

## Steps
1. Check the Vercel status page for a platform-wide incident first (rules
   out a Vercel outage before assuming a config problem).
2. Confirm DNS propagation: `nslookup <domain>` and
   `nslookup www.<domain>` from the operator machine; compare against the
   nameserver pair shown in Vercel -> Domains for this project (never
   hardcoded — read live, per open item #2, §16).
3. Confirm the domain's nameservers at Namecheap match the Vercel-provided
   pair exactly (dashboard check) — a partial or stale NS set is the most
   common cause of intermittent resolution.
4. In Vercel -> Domains, confirm: apex domain attached, `www` present and
   set to redirect to apex, no conflicting/duplicate domain entries across
   projects.
5. Check TLS certificate status in the Vercel dashboard (auto-issued certs
   can stall on DNS misconfiguration).
6. Once corrected, re-run Gate G8 assertions:
   `curl -sI https://<domain>/` -> 200, valid TLS, **no**
   `X-Robots-Tag` header; confirm `www` redirects to apex; confirm
   `.vercel.app` still noindexed.

## Verification
- `curl -sI https://<domain>/` returns 200 with valid TLS and no
  `X-Robots-Tag`.
- `www.<domain>` redirects to the apex.
- Canonical tags on live pages point to `https://<domain>/...`.
- Better Stack monitor returns to "up" status.

## Escalation
DNS propagation can legitimately take 10 minutes to 48 hours (§8 P7) —
don't escalate purely for elapsed time within that window. If nameservers
are confirmed correct and >48h has passed with no resolution, or if the
Vercel status page shows an active incident affecting domains,
escalate to [HUMAN] (registrar-side account issue is possible and requires
Namecheap dashboard access, which AI never has).
