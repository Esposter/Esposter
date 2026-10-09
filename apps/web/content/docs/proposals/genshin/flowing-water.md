---
title: Flowing water
description: Proposal — what is still unbuilt of Genshin's rivers and waterfalls. The river ribbon and waterfall sheet, and the flow they move with, are built; what remains is where the game places each river's course and each fall, fitted to the game's own water, and the mist and foam pool at a fall's foot, judged by their statistics.
model: claude-opus-5-5
needs: [game-exports]
---

# Flowing water

The shapes and the flow are built: see [flowing water](/docs/genshin/flowing-water). This page keeps what the game must still supply.

## Decisions

- **A river's course is the game's.** The water surfaces the game places along a river are read in the region's layout pass, and a river's ribbon is fitted to them: its course, width and level. Its shape is gated as any shape is, by its outline and depth against the exports drawn at each reference's camera.
- **Its flow is read before it is measured.** The direction and speed its ripples and foam move at come from the game's own water material and its texture coordinates where the export holds them; what it holds without fields is measured off a recording of the river in the motion pass. Foam collects at rocks and bends ([flowing water](/docs/genshin/flowing-water)).
- **Waterfalls are objects the game places.** Each sheet stands where its record sets it, a mesh with scrolling streaks fitted to the game's own in an object pass. The mist and foam pool at its foot are particles, so they are judged by their statistics against a recording, their spread, density and colour, never pixel for pixel.

## Deferred compute

- The river courses and waterfall records, read from the region's layout pass and the object pass, are not in the repo. Each needs its game export before fitting.
- The mist and foam pool particles are not built: their emitter and their statistics are judged against a recording of the game's falls.
- How tight a bend gathers full foam on its outer bank is provisional, fitted to a recording of a bending river once its course is placed.

## Notes

- **Swimming is play.** Moving through the water, with its stamina, waits for the phase-three character controller.
