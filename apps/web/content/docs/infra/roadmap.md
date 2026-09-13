---
title: Roadmap
description: Open infrastructure work — every item links its proposal.
---

# Roadmap

Open work, each item linking its proposal. Ideas parked behind a revisit trigger live in [deferred](/docs/infra/deferred) instead. Rationale lives in [Cost & Security Posture](/docs/infra/cost-and-security-posture) and `apps/infra/docs/`.

## Review collector follow-ons

- [ ] rotate `REVIEW_COLLECTOR_TOKEN` from the account's `gh` login token to a fine-grained personal access token scoped to this repository, supplied with `pulumi config set --secret` ([runner](/docs/infra/review-collector/runner))
- [ ] the `status` event as a further free signal for the [runner](/docs/infra/review-collector/runner) — it fires on the commit status CodeRabbit flips at completion, so it covers a rate-limited completion that posts no review body; it runs from the default branch only, so it waits on the workflow file reaching `main`

## Blocked (app-side migration off key-based auth first)

- [ ] [Keyless auth hardening](/docs/proposals/infra/keyless-auth-hardening) — service-principal credentials in the app, then disable shared-key/local auth + network default-deny
