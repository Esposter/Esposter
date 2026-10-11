---
title: Compute queue: Settings
description: The settings screen's runs: the follow camera's defaults and the Graphics rows scored over the whole frame.
---

# Settings

## Queue

- [ ] `[page]` {settings-graphics-rows} needs game-exports, media-engine, parity-page — **Settings: the Graphics rows and the Audio tab, scored over the whole frame.** Reads `captures/yt-5EmJX_RyuY8-menu-settings.mp4`, the English PC client at 1080p and 60 frames a second, nothing over it but the game's UID: the Graphics tab from about 120 seconds, the Graphics Quality row's choices open at about 121 to 123, the Custom rows and their choices to about 175, and the Audio tab from about 175 to 180. Each row's place and label read from the clip's frames, the Audio tab's rows and volumes built beside them, and the frame scored with `pnpm -C scripts genshin:parity compare settings-graphics-rows`, a reference the clip adds. Bar: 2%, with the blurred world counted as the one thing the page cannot draw.

## Waiting

- [ ] `[page]` {follow-camera-settings-defaults} needs game-exports, parity-page — **Follow camera: the Controls tab's defaults, read off the interface export.** Reads the Settings screen's Controls tab from the interface export, once `genshin:assets interface` exists; the two sensitivities and the default distance are written to `FOLLOW_CAMERA_DEFAULT_SETTINGS` (`packages/genshin-engine/src/camera/constants.ts`), its provisional comment replaced by how each was read ([follow camera](/docs/genshin/follow-camera)). Bar: each default equal to the game's shown value. — blocked: `genshin:assets interface` is written (07f8862396) but takes only a `DerivedAssetComponent`, and none of them is the Settings screen, so no Controls tab is exported; the item also has no command for its write into `constants.ts`.
