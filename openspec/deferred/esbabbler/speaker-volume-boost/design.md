# Speaker Volume >100% Boost

Let the master Speaker Volume slider boost past 100% by routing remote audio through a Web Audio gain stage instead of `HTMLMediaElement.volume` (which caps at 1.0).

**Why deferred**

- Requires routing every remote audio element through a Web Audio gain stage, changing the audio pipeline for everyone to serve an edge preference.
- [Per-user volume](../../../specs/esbabbler/calls/per-user-volume/design.md) shares the same `HTMLMediaElement.volume` path, so its >100% range clamps to full too — a Web Audio migration would unlock boost for both at once.

**Revisit when:** users report calls being too quiet even at 100%.
