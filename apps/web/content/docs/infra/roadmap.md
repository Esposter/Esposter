---
title: Roadmap
description: Open infrastructure work — every item links its proposal.
---

# Roadmap

Open work, each item linking its proposal. Ideas parked behind a revisit trigger live in [deferred](/docs/infra/deferred) instead. Rationale lives in [Cost & Security Posture](/docs/infra/cost-and-security-posture) and `apps/infra/docs/`.

## Open

- [ ] [Voice match benchmark](/docs/infra/claude-interface/voice-match-benchmark) — the ear's half: rank the top three candidates by ear for a sample of characters, compute the rank correlation against the composite, tune the weights on that sample alone, then the style pass over the chosen voices. The tooling and the measured table are built

## Blocked (app-side migration off key-based auth first)

- [ ] [Burst animation](/docs/proposals/infra/burst-animation) — the session character's elemental burst in a pane the start hook opens beside the welcome, gathered from the wiki's official teasers and pre-rendered once per machine at the best rung that terminal draws; the per-character label and one terminal's throughput are open
- [ ] [Keyless auth hardening](/docs/proposals/infra/keyless-auth-hardening) — service-principal credentials in the app, then disable shared-key/local auth + network default-deny
