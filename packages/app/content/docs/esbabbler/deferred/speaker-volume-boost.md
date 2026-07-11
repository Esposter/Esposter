---
title: Speaker volume boost
description: Deferred — >100% speaker volume via LiveKit webAudioMix.
---

# Speaker Volume >100% Boost

Let the master Speaker Volume slider boost past 100% by routing remote audio through LiveKit's `webAudioMix` (a Web Audio gain stage) instead of `HTMLMediaElement.volume` (which caps at 1.0).

**Why deferred**

- Requires switching the Room to `webAudioMix`, changing the audio pipeline for everyone to serve an edge preference.
- [Per-user volume](/docs/esbabbler/calls/per-user-volume) shares the same `HTMLMediaElement.volume` path, so its >100% range clamps to full too — a `webAudioMix` migration would unlock boost for both at once.

**Revisit when:** users report calls being too quiet even at 100%.
