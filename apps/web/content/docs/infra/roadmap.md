---
title: Roadmap
description: Open infrastructure work — every item links its proposal.
---

# Roadmap

Open work, each item linking its proposal. Ideas parked behind a revisit trigger live in [deferred](/docs/infra/deferred) instead. Rationale lives in [Cost & Security Posture](/docs/infra/cost-and-security-posture) and `apps/infra/docs/`.

## Open

- [ ] [Character voice](/docs/proposals/infra/character-voice) — every character read in their own cloned voice by a local engine run from Node, the Azure Speech path removed end to end, and the benchmark's reference stage kept to choose and score each character's reference line

## Blocked (app-side migration off key-based auth first)

- [ ] [Keyless auth hardening](/docs/proposals/infra/keyless-auth-hardening) — service-principal credentials in the app, then disable shared-key/local auth + network default-deny
