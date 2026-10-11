---
title: Compute queue: World
description: The world's own runs: the thunderstorm's frames, the teleport's fades, the weather's turn and lightning, the props scripts spawn and the HUD.
---

# World

## Queue

- [ ] `[cpu]` {world-thunderstorm} needs game-exports, media-engine — **World: a thunderstorm, frame by frame.** `pnpm -C scripts genshin:parity frames "$HOME/Esposter/genshin-parity/captures/world-thunderstorm.mkv" 60 0 50`. Reads a recording of Yashiori Island's thunderstorm, 50 seconds of it on a fixed camera at 59.94 frames a second, its picture pillarboxed to 1520 by 1080 at x 198 in a 1920 frame; the clip is in `captures`. Writes 3000 stills and a contact sheet under `~/Esposter/genshin-parity/frames/world-thunderstorm@0/`, outside the repository. Bar: the 3000 stills and the sheet written.

## Waiting

- [ ] `[cpu]` {script-spawns-unplaced-prefab} needs game-install — **Script spawns: each unplaced prefab's anchor, read from the scripts that spawn it.** The collapsed tops `tree` counts as unplaced spawns (effects, stage props, the Area and SceneObj families) are dropped from the witness and the region layout, since no static placement sets them down. Once a script's spawn records are decoded, each spawn joins its component's `spawns` in `DerivedAssetComponentMap` at its anchor, so it stands where the game puts it. Bar: each capital's `tree` line for unplaced spawns falls by the spawns placed, and no spawned prefab is a lost father. — blocked: the input is a decoded spawn config, which does not exist yet. It needs, for each script that instantiates prefabs, the anchor each spawn goes into (its game object's block and path ID), the prefab, and the position or the copy count its record gives, read from the script's raw bytes the way the login's `MonoLoginScene` spawns were (`Login/Scene/Index.reference.ts`, `DerivedAssetComponentMap`'s `spawns`), for every capital's scripts.
- [ ] `[page]` {hud-world-approve} needs parity-page — **World: the HUD over its whole frame.** The HUD's references are regions over `captures/world-pickup.mkv`, which already shows the HUD. Once `world-hud-hidden.mkv` is cut, `pnpm -C scripts genshin:parity compare` and `approve` run on its whole frame. Writes the screen's image beside its component once approved. Bar: FLIP under 0.05, the global default, as the screen records no bar. — blocked: `world-hud-hidden.mkv` is on the roadmap's References sought list.
