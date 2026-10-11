---
title: Compute queue: Settings
description: The settings screen's runs: the follow camera's defaults and the Graphics rows scored over the whole frame.
---

# Settings

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {follow-camera-settings-defaults} needs game-exports, parity-page — **Follow camera: the Controls tab's defaults, read off the interface export.** Reads the Settings screen's Controls tab from the interface export, once `genshin:assets interface` exists; the two sensitivities and the default distance are written to `FOLLOW_CAMERA_DEFAULT_SETTINGS` (`packages/genshin-engine/src/camera/constants.ts`), its provisional comment replaced by how each was read ([follow camera](/docs/genshin/follow-camera)). Bar: each default equal to the game's shown value. — blocked: the interface export has no Controls tab extracted, and the `interface` verb is not written yet.
- [ ] `[page]` {settings-graphics-rows} needs game-exports, media-engine, parity-page — **Settings: the Graphics rows and the Audio tab, scored over the whole frame.** Waits on `menu-settings.mkv`. Each row's place and label read from the clip's frames, the Audio tab's rows and volumes built beside them, and the frame scored with `pnpm -C scripts genshin:parity compare settings-graphics-rows`, a reference the clip adds. Bar: 2%, with the blurred world counted as the one thing the page cannot draw.
