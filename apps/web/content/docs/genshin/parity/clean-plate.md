---
title: Parity clean plate
description: A reference drawn behind an interface is compared over a clean plate, its interface region filled from the pixels around it.
---

# Parity clean plate

An interface drawn over a scene is compared over the scene's own colour, not over the game's interface.

- **An interface over a scene is compared over the reference's clean plate.** A reference with `isBackdrop` has a plate drawn behind the screen: its own frame with its scored region filled from the pixels around it, the harmonic fill of Laplace's equation inside the region with its one-pixel ring as the boundary, cached beside the reference by its hash and region. The game's interface inside the region is gone, so the world's low-frequency colour stays roughly right behind it and every drawn piece is scored against what is really there. The backdrop is not the frame itself: the frame would score a render drawing nothing near 0%, so each piece could only add error and the score would reward drawing less. A reference whose region covers the whole frame has no border to fill from, so it keeps its frame. A capture's frame is rewritten without the gamma and primaries FFmpeg tags it with, since a browser colour-manages a tagged image and drew the frame darker than its own file. Glass the interface draws translucent (the prompt band) lands on the recording's own glass and darkens twice, so its colour is solved from the scene around it, and the score holds its opaque pieces and every placement. The login's interface reached a few tenths of a percent on each stage this way, the rest being the older build's build string and repair button.

## Key files

| File                                                                | Role                                                                                                                     |
| :------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| `scripts/src/services/recreation/image/fillRegionHarmonically.ts`   | The harmonic fill of a region from its one-pixel ring, the pure function a clean plate is made of                        |
| `scripts/src/services/genshinParity/reference/getCleanPlatePath.ts` | A reference's clean plate, filled once and cached beside it by its hash and region; none for a region covering the frame |
