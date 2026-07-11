---
title: Games integration
description: Rejected — bringing clicker, dungeons, fluid-simulator, and anime onto the resource/dataset layers.
---

# Games integration

Bringing clicker, dungeons, fluid-simulator, and anime onto the resource/dataset layers.

## Why not

A game save is genuinely one blob per user — naming, listing, sharing, and dataset semantics add nothing. Achievements already integrate games with the platform through the tRPC-path middleware, which is the only cross-product touchpoint that makes sense for them. Forcing them onto resources would be architecture for its own sake.
