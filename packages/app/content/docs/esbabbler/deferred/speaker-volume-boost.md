---
title: Speaker volume boost
description: Deferred — >100% speaker volume via LiveKit webAudioMix.
---

# Speaker Volume >100% Boost

Let the master Speaker Volume slider boost past 100% by routing remote audio through LiveKit's `webAudioMix` (a Web Audio gain stage) instead of `HTMLMediaElement.volume` (which caps at 1.0).

**Why deferred**

- Requires switching the Room to `webAudioMix`, changing the audio pipeline for everyone to serve an edge preference.
- The per-track path already supports boost where it matters ([per-user call volume](/docs/proposals/esbabbler/per-user-call-volume) uses `participant.setVolume`, which boosts >100%).

**Revisit when:** users report calls being too quiet even at 100% with per-user boost available.
