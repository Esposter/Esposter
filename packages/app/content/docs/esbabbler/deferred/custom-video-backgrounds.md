---
title: Custom video backgrounds
description: Deferred — user-uploaded virtual background images for calls.
---

# Custom Video Backgrounds

Let users upload their own virtual background images (the call already applies starter presets via `@livekit/track-processors`).

**Why deferred**

- Per-user blob storage cost + upload/moderation surface for a cosmetic feature (same cost family as [custom emoji](/docs/esbabbler/deferred/custom-emoji)).
- The preset mechanism already proves the processor pipeline; uploading is only storage + picker work.

**Revisit when:** users ask for it, or custom emoji ships (the two share the upload/moderation answer).
