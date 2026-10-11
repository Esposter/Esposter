---
title: Compute queue: Capitals
description: The witness runs that lay out the capitals as the game draws them, owed for Fontaine.
---

# Capitals

## Queue

- [ ] `[cpu]` {fontaine-capital} needs game-install, game-exports — **Fontaine: the capital laid out as the witness draws it.** `pnpm -C scripts genshin:assets extract fontaine` with the game closed, then `pnpm -C scripts genshin:assets witness fontaine`. Reads `~/Esposter/genshin-parity/extracted/fontaine/`. Writes `witness.json` and its `assets/` beside it. Measure: `pnpm -C scripts genshin:assets tree fontaine` prints `architecture placed within 600 metres of the capital` above 0 and `architecture lost fathers within 600 metres of the capital: 0`. Unplaced spawns are their own line and never fail it.

## Waiting

- [ ] `[cpu]` {capital-area-outlines} needs game-exports — **Capitals: each capital's area outlined as the game draws it.** blocked: the game's area shapes have no extracted source yet, so the squares the [world map](/docs/genshin/world-map) draws stay provisional. Bar: each capital's outline drawn from that source, in place of its square.
