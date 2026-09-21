---
title: Roadmap
description: Open infrastructure work — every item links its proposal.
---

# Roadmap

Open work, each item linking its proposal. Ideas parked behind a revisit trigger live in [deferred](/docs/infra/deferred) instead. Rationale lives in [Cost & Security Posture](/docs/infra/cost-and-security-posture) and `apps/infra/docs/`.

## Open

- [ ] [Seamless spoken replies](/docs/proposals/infra/seamless-spoken-replies) — reading while the reply is written first, since the tool's mid-reply hook is verified on this machine; never pausing, then first sound within a fraction of a second, wait on a GPU that makes speech tokens faster than they are spoken

## Blocked (a Transformers.js release that loads Chatterbox Multilingual)

- [ ] [Multilingual spoken replies](/docs/proposals/infra/multilingual-spoken-replies) — the text's script picks the model's language token, the dub keeps picking the voice, and the output streams by clause to pay for the slower engine

## Blocked (app-side migration off key-based auth first)

- [ ] [Keyless auth hardening](/docs/proposals/infra/keyless-auth-hardening) — service-principal credentials in the app, then disable shared-key/local auth + network default-deny
