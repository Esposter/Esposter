---
title: Water screen-space reflections
description: Reflections of the shore and landmarks in the water through three's SSRNode, near the camera — deferred while the sky's reflection carries the look.
---

# Water screen-space reflections

The water proposal added screen-space reflections through three's `SSRNode` near the camera, so a shore's trees and a landmark would show in the water, on top of the sky's colours it always reflects.

**Why deferred:** The game's water reads as bright, clear and glinting, which the sky's reflection, the foam and the stepped glints already draw. A reflection pass costs a full-screen ray march and a normal target, and the proposal never let the look depend on it.

**Revisit when:** a region's reference shows landmarks mirrored in still water as part of its look, as a calm harbour or a lake at dusk does, and the high tier has budget left.
