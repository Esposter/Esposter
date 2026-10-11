---
title: World stalls
description: Proposal — the Windrise frame's remaining GPU stalls. The trace names each stall and its pass; what is left is the scene pass's cost per object kind, a cascade redraw that waits on the camera to stop, and the vertex uniform buffers rewritten with the same bytes each frame, which an instanced attribute or a storage buffer would replace.
model: claude-opus-5-5
needs: [parity-page]
touches:
  [
    "packages/genshin-engine/src/atmosphere/createSunLight.ts",
    "packages/genshin-engine/src/models/nodes/AnchoredCascadeShadowNode.ts",
    "packages/genshin-world/src/composables/useSunShadow.ts",
  ]
---

# World stalls

The [rendering style](/docs/genshin/rendering-style) page keeps the frame as built. Its last section names the Windrise stalls and what the trace leaves of them: the GPU's own time, which the trace can time per pass on adapters with timestamp queries. Three things remain before a stall is answered.

## Decisions

- **The cost is measured per object kind before anything changes.** A stall is answered by the pass and object kind that the trace times, not by the frame's total.
- **The cascades redraw only when their casters move.** The trigger that redraws the sun's cascades stays on the character's body and the enemies, so a still camera draws nothing new. Any change keeps that rule.
- **Per-frame uniform writes end.** A vertex uniform buffer rewritten with the same bytes each frame moves to an instanced attribute or a storage buffer, written once when its contents change.

## Scope

1. Run the trace on `WorldScreen` and record each pass's GPU time by object kind.
2. Give the cascades' redraw trigger a check that holds while the camera is still.
3. Move each vertex uniform buffer that is rewritten unchanged to an instanced attribute or a storage buffer.
4. Re-run the trace and keep the change only where the GPU time falls.

## Key files

| File                                                                    | Role                                                 |
| :---------------------------------------------------------------------- | :--------------------------------------------------- |
| `packages/genshin-engine/src/atmosphere/createSunLight.ts`              | Switches the sun's cascades on and off for the frame |
| `packages/genshin-engine/src/models/nodes/AnchoredCascadeShadowNode.ts` | Fits each cascade to a sphere about the anchor       |
| `packages/genshin-world/src/composables/useSunShadow.ts`                | Flags the cascades to redraw as the casters move     |
