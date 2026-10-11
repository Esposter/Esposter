---
title: Compute queue: Settings
description: The settings screen's runs: the follow camera's defaults.
---

# Settings

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {follow-camera-settings-defaults} needs game-exports, parity-page — **Follow camera: the Controls tab's defaults, read off the interface export.** Reads the Settings screen's Controls tab from the interface export, once `genshin:assets interface` exists; the two sensitivities and the default distance are written to `FOLLOW_CAMERA_DEFAULT_SETTINGS` (`packages/genshin-engine/src/camera/constants.ts`), its provisional comment replaced by how each was read ([follow camera](/docs/genshin/follow-camera)). Bar: each default equal to the game's shown value. — blocked: `genshin:assets interface` takes only a `DerivedAssetComponent`, none of which is the Settings screen, so no Controls tab is exported; the item also has no command for its write into `constants.ts`.
