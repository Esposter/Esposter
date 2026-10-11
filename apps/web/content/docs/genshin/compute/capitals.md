---
title: Compute queue: Capitals
description: The witness runs that lay out the capitals as the game draws them, owed for Fontaine.
---

# Capitals

## Queue

- [ ] `[cpu]` {fontaine-capital} needs game-install, game-exports — **Fontaine: the capital laid out as the witness draws it.** `pnpm -C scripts genshin:assets extract fontaine` with the game closed, then `pnpm -C scripts genshin:assets witness fontaine`. Reads `~/Esposter/genshin-parity/extracted/fontaine/`. Writes `witness.json` and its `assets/` beside it. Measure: `pnpm -C scripts genshin:assets tree fontaine` prints `architecture placed within 600 metres of the capital` above 0 and `architecture lost fathers within 600 metres of the capital: 0`. Unplaced spawns are their own line and never fail it.

## Waiting

- [ ] `[cpu]` {capital-area-outlines} needs game-exports — **Capitals: each capital's area outlined as the game draws it.** blocked: no asset the exports' index names holds an area's shape, so each capital's area is outlined round the tiles its waypoints stand on (`fitAreaOutlines`, [world map](/docs/genshin/world-map)), and Everfrozen Earth by a provisional square. Bar: each capital's outline read from the game's own shape, in place of the one drawn round its tiles.
