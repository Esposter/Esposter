---
title: Roadmap
description: Open infrastructure work — every item links its proposal.
---

# Roadmap

Open work, each item linking its proposal. Ideas parked behind a revisit trigger live in [deferred](/docs/infra/deferred) instead. Rationale lives in [Cost & Security Posture](/docs/infra/cost-and-security-posture) and `apps/infra/docs/`.

## Open

- [ ] [Seamless spoken replies](/docs/proposals/infra/seamless-spoken-replies) — first sound within a fraction of a second of a spoken line being written, by vocoding a line in chunks as its tokens are made; the never-pausing stage before it holds since the engine moved to Nano

## Blocked (the character voice still switched on after two weeks of daily use)

- [ ] [The viewer as the stage](/docs/proposals/infra/viewer-stage) — each spoken line a bubble and a sound on the model in the desktop viewer already running, through its local socket, and the terminal's attention hooks moving the model; no window built
- [ ] [Chat into the session](/docs/proposals/infra/channel-chat) — a local chat page as a channel pushing typed lines into the terminal's own session, and a permission answered by tapping the model; behind the research-preview flag on every launch

## Blocked (a Transformers.js release that loads Chatterbox Multilingual)

- [ ] [Multilingual spoken replies](/docs/proposals/infra/multilingual-spoken-replies) — the text's script picks the model's language token, the dub keeps picking the voice, and the output streams by clause to pay for the slower engine

## Blocked (app-side migration off key-based auth first)

- [ ] [Keyless auth hardening](/docs/proposals/infra/keyless-auth-hardening) — service-principal credentials in the app, then disable shared-key/local auth + network default-deny
