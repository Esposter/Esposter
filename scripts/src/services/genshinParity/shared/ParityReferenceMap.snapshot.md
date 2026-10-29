# Parity scores

Every reference's last `pnpm -C scripts genshin:parity compare`, which rewrites its own row (`--all` rewrites them
all). The mean difference, the tone and FLIP's perceptual error run from 0 (identical) up; the shape is the share of
the reference's edges the shot shares, 1 identical. Commit it with the change that moved it, as a bench's report is
committed.

| Reference | Screen | Mean difference | Shape | Tone | FLIP |
| :-------- | :----- | --------------: | ----: | ---: | ---: |
| `character-artifacts` | `CharacterScreen` | 3.01% | 0.829 | 1.44% | 0.1319 |
| `character-artifacts-tabs` | `CharacterScreen` | 0.88% | 0.976 | 0.32% | 0.0474 |
| `character-attributes` | `CharacterScreen` | 1.95% | 0.910 | 0.90% | 0.0756 |
| `character-attributes-panel` | `CharacterScreen` | 4.23% | 0.682 | 2.41% | 0.1634 |
| `character-attributes-tabs` | `CharacterScreen` | 0.97% | 0.985 | 0.34% | 0.0441 |
| `character-attributes-top` | `CharacterScreen` | 8.40% | 0.839 | 3.64% | 0.3184 |
| `character-constellation` | `CharacterScreen` | 2.06% | 0.885 | 1.09% | 0.0772 |
| `character-constellation-tabs` | `CharacterScreen` | 1.31% | 0.979 | 0.44% | 0.0478 |
| `character-talents` | `CharacterScreen` | 1.86% | 0.900 | 0.76% | 0.0800 |
| `character-talents-tabs` | `CharacterScreen` | 0.89% | 0.978 | 0.28% | 0.0466 |
| `character-weapons` | `CharacterScreen` | 2.51% | 0.888 | 1.47% | 0.1066 |
| `character-weapons-tabs` | `CharacterScreen` | 0.89% | 0.976 | 0.30% | 0.0453 |
| `cooking-screen` | `CookingScreen` | 1.21% | 0.860 | 0.58% | 0.0564 |
| `court-of-fontaine-location` | `WorldScreen` | 31.74% | 0.202 | 27.65% | 0.8417 |
| `crafting-strongbox` | `CraftingStrongbox` | pending: no screenshot of the screen yet | | | |
| `crafting-table` | `CraftingScreen` | pending: its recording is not on disk | | | |
| `dialogue-choices-line` | `DialogueTalk` | 8.99% | 0.924 | 2.15% | 0.2757 |
| `dialogue-choices-replies` | `DialogueTalk` | 14.36% | 0.766 | 8.59% | 0.4588 |
| `dialogue-choices-speaker` | `DialogueTalk` | 7.80% | 0.632 | 5.07% | 0.3150 |
| `dialogue-line` | `DialogueTalk` | 10.61% | 0.982 | 2.29% | 0.3704 |
| `dialogue-paimon-line` | `DialogueTalk` | 10.21% | 0.947 | 2.93% | 0.3029 |
| `everfrozen-earth-location` | `WorldScreen` | 20.61% | 0.234 | 19.75% | 0.6327 |
| `exit-prompt` | `MenuExit` | 8.36% | 0.909 | 33.71% | 0.2227 |
| `forge-screen` | `ForgeScreen` | 6.52% | 0.677 | 5.33% | 0.2162 |
| `forge-screen-ores-done` | `ForgeScreen` | 3.50% | 0.774 | 2.25% | 0.1559 |
| `forge-screen-queues` | `ForgeScreen` | 3.71% | 0.759 | 2.35% | 0.1665 |
| `forge-screen-refused` | `ForgeScreen` | pending: no screenshot of this variant yet | | | |
| `forge-screen-weapons-done` | `ForgeScreen` | pending: no screenshot of this variant yet | | | |
| `gcg-duel-board` | `GcgScreen` | 13.25% | 0.508 | 8.21% | 0.4544 |
| `handbook-experience` | `HandbookScreen` | 5.28% | 0.859 | 2.95% | 0.2516 |
| `health-notice` | `SplashHealthNotice` | 6.17% | 0.964 | 1.51% | 0.1780 |
| `health-notice-japanese` | `SplashHealthNotice` | 11.47% | 0.583 | 4.60% | 0.3327 |
| `health-notice-mainland` | `SplashHealthNotice` | 7.06% | 0.829 | 3.03% | 0.1974 |
| `hud-paimon-button` | `HudScreen` | 1.90% | 0.936 | 4.74% | 0.1188 |
| `hud-stamina-climb` | `HudScreen` | 0.62% | 0.787 | 0.75% | 0.0629 |
| `hud-world-keys` | `HudScreen` | 2.51% | 0.963 | 1.72% | 0.1607 |
| `hud-world-pickup` | `HudScreen` | 3.58% | 0.714 | 2.20% | 0.1451 |
| `interaction-prompts-jueyun-chili` | `InteractionPromptList` | 5.07% | 0.949 | 1.78% | 0.2144 |
| `interaction-prompts-pickup` | `InteractionPromptList` | 7.92% | 0.919 | 4.43% | 0.3313 |
| `inventory-food` | `InventoryScreen` | 3.34% | 0.966 | 1.92% | 0.1900 |
| `inventory-weapons` | `InventoryScreen` | 13.13% | 0.572 | 9.72% | 0.4374 |
| `liyue-harbor-location` | `WorldScreen` | 29.33% | 0.303 | 24.45% | 0.8094 |
| `loading-startup` | `LoadingStartup` | 0.03% | 0.989 | 0.00% | 0.0013 |
| `login-dawn-title` | `LoginScreen` | 10.30% | 0.479 | 7.30% | 0.4135 |
| `login-day-title` | `LoginScreen` | 12.93% | 0.333 | 9.86% | 0.4689 |
| `login-door` | `LoginScreen` | 13.37% | 0.204 | 11.09% | 0.5029 |
| `login-door-recording` | `LoginScreen` | 16.44% | 0.366 | 11.47% | 0.5796 |
| `login-door-session` | `LoginScreen` | 12.25% | 0.417 | 8.41% | 0.4567 |
| `login-interface-arriving` | `LoginInterface` | pending: no screenshot of this variant yet | | | |
| `login-interface-door` | `LoginInterface` | 0.75% | 0.985 | 0.44% | 0.0459 |
| `login-interface-door-mainland` | `LoginInterface` | 0.65% | 0.975 | 0.45% | 0.0265 |
| `login-interface-loading` | `LoginInterface` | 0.34% | 0.995 | 0.11% | 0.0285 |
| `login-interface-loading-game` | `LoginInterface` | pending: no screenshot of this variant yet | | | |
| `login-interface-mainland-rating` | `LoginInterface` | 3.85% | 0.953 | 2.62% | 0.2090 |
| `login-interface-title` | `LoginInterface` | 0.51% | 0.997 | 0.25% | 0.0353 |
| `login-night-title` | `LoginScreen` | 9.41% | 0.371 | 7.01% | 0.3913 |
| `login-screen-dusk` | `LoginScreen` | 19.45% | 0.358 | 13.81% | 0.6448 |
| `map-overlay-galesong` | `MapOverlay` | 17.65% | 0.000 | 12.94% | 0.6686 |
| `map-overlay-jueyun` | `MapOverlay` | 65.65% | 0.163 | 38.75% | 0.8931 |
| `menu-exit-hover` | `MenuExit` | 6.51% | 0.484 | 5.49% | 0.2230 |
| `menu-exit-pressed` | `MenuExit` | 7.26% | 0.451 | 6.61% | 0.2359 |
| `menu-paimon-disabled` | `MenuPaimon` | pending: no screenshot of this variant yet | | | |
| `menu-paimon-hover` | `MenuPaimon` | pending: no screenshot of this variant yet | | | |
| `menu-paimon-pressed` | `MenuPaimon` | pending: no screenshot of this variant yet | | | |
| `menu-time` | `MenuTime` | 1.55% | 0.825 | 1.24% | 0.0377 |
| `menu-world-level-prompt` | `MenuWorldLevelPrompt` | pending: no screenshot of the screen yet | | | |
| `menu-world-level-prompt-hover` | `MenuWorldLevelPrompt` | pending: no screenshot of this variant yet | | | |
| `menu-world-level-prompt-pressed` | `MenuWorldLevelPrompt` | pending: no screenshot of this variant yet | | | |
| `menu-world-level-prompt-revert` | `MenuWorldLevelPrompt` | pending: no screenshot of this variant yet | | | |
| `mondstadt-city-location` | `WorldScreen` | 26.66% | 0.292 | 22.43% | 0.7549 |
| `nasha-town-location` | `WorldScreen` | 29.69% | 0.238 | 24.60% | 0.7627 |
| `paimon-menu` | `MenuPaimon` | 5.16% | 0.904 | 3.48% | 0.2170 |
| `people-of-the-springs-location` | `WorldScreen` | 25.06% | 0.223 | 21.49% | 0.7945 |
| `publisher-splash` | `SplashPublisher` | 0.07% | 1.000 | 0.01% | 0.0036 |
| `quest-screen` | `QuestScreen` | 18.23% | 0.584 | 15.57% | 0.5291 |
| `quest-screen-details` | `QuestScreen` | 21.43% | 0.926 | 19.93% | 0.5660 |
| `quest-screen-header` | `QuestScreen` | 9.04% | 0.928 | 8.26% | 0.3522 |
| `quest-screen-list` | `QuestScreen` | 28.58% | 0.149 | 24.64% | 0.5853 |
| `reputation-screen` | `ReputationScreen` | 2.10% | 0.877 | 1.39% | 0.1458 |
| `settings-audio-rows` | `MenuSettings` | 1.01% | 0.995 | 0.38% | 0.0745 |
| `settings-graphics` | `MenuSettings` | 1.59% | 0.996 | 1.26% | 0.1020 |
| `settings-graphics-rows` | `MenuSettings` | 1.07% | 0.998 | 0.40% | 0.0888 |
| `spiral-abyss-benediction` | `SpiralAbyssBenediction` | 2.00% | 0.736 | 1.31% | 0.0787 |
| `spiral-abyss-entry` | `SpiralAbyssEntry` | pending: no screenshot of the screen yet | | | |
| `splash-title-chinese-traditional` | `SplashTitle` | pending: no screenshot of this variant yet | | | |
| `splash-title-japanese` | `SplashTitle` | 0.16% | 1.000 | 0.39% | 0.0342 |
| `splash-title-korean` | `SplashTitle` | pending: no screenshot of this variant yet | | | |
| `sumeru-city-location` | `WorldScreen` | 32.42% | 0.227 | 28.07% | 0.8157 |
| `title-splash` | `SplashTitle` | 0.20% | 1.000 | 0.01% | 0.0090 |
| `title-splash-mainland` | `SplashTitle` | 1.89% | 0.991 | 0.89% | 0.0807 |
| `weapon-screen` | `WeaponScreen` | 72.12% | 0.211 | 66.35% | 0.9441 |
| `weapon-screen-ascend` | `WeaponScreen` | 74.41% | 0.260 | 68.43% | 0.9562 |
| `weapon-screen-at-cap` | `WeaponScreen` | pending: the recording zooms over the state, so no whole-screen frame shows it | | | |
| `weapon-screen-rank-five` | `WeaponScreen` | pending: no screenshot of this variant yet | | | |
| `weapon-screen-refine` | `WeaponScreen` | 72.14% | 0.156 | 65.73% | 0.9507 |
| `weapon-screen-two-star` | `WeaponScreen` | pending: no screenshot of this variant yet | | | |
| `windrise-statue-day` | `WorldScreen` | 26.73% | 0.306 | 26.74% | 0.7579 |
| `wish-screen` | `WishScreen` | 9.75% | 0.499 | 7.07% | 0.2948 |
| `world-level-dialog` | `MenuWorldLevelDialog` | 5.86% | 0.862 | 1.99% | 0.1965 |
| `world-realm-placement-editor` | `WorldRealmPlacementEditor` | pending: no screenshot of the screen yet | | | |
| `world-realm-placement-editor-at-load` | `WorldRealmPlacementEditor` | pending: no screenshot of this variant yet | | | |

## Layers

Each scene's shot scored again over each family of its parts, as the witness's part target lays them at the
reference's view, and over the sky, within the region its row above scores, so its frame is that row: its share of
the region, the CIELab distance between its mean colour and the reference's, and its tone and FLIP, so a family
drawn away from the reference shows on its own row.

| Layer | Coverage | Colour | Tone | FLIP |
| :---- | -------: | -----: | ---: | ---: |
| `court-of-fontaine-location/frame` | 100.0% | 24.06 | 27.65% | 0.8417 |
| `court-of-fontaine-location/sky` | 100.0% | 24.06 | 27.65% | 0.8417 |
| `everfrozen-earth-location/frame` | 100.0% | 25.50 | 19.75% | 0.6327 |
| `everfrozen-earth-location/sky` | 100.0% | 25.50 | 19.75% | 0.6327 |
| `liyue-harbor-location/frame` | 100.0% | 14.10 | 24.45% | 0.8094 |
| `liyue-harbor-location/sky` | 100.0% | 14.10 | 24.45% | 0.8094 |
| `login-dawn-title/frame` | 100.0% | 4.40 | 7.30% | 0.4135 |
| `login-dawn-title/Bridges` | 2.5% | 6.77 | 7.53% | 0.4920 |
| `login-dawn-title/Towers` | 35.5% | 8.43 | 8.28% | 0.4788 |
| `login-dawn-title/Walkway` | 13.3% | 7.39 | 10.29% | 0.5582 |
| `login-dawn-title/sky` | 48.7% | 2.13 | 5.77% | 0.3222 |
| `login-day-title/frame` | 100.0% | 2.39 | 9.86% | 0.4689 |
| `login-day-title/Bridges` | 1.8% | 1.01 | 4.12% | 0.3983 |
| `login-day-title/Towers` | 55.6% | 4.24 | 11.69% | 0.5342 |
| `login-day-title/Walkway` | 8.5% | 5.18 | 10.16% | 0.4929 |
| `login-day-title/sky` | 34.1% | 1.06 | 7.09% | 0.3602 |
| `login-door/frame` | 100.0% | 8.01 | 11.09% | 0.5029 |
| `login-door/Walkway` | 20.4% | 13.08 | 11.50% | 0.5684 |
| `login-door/Bridges` | 8.3% | 9.40 | 8.46% | 0.4851 |
| `login-door/Towers` | 30.1% | 1.19 | 9.48% | 0.4979 |
| `login-door/sky` | 41.3% | 12.05 | 12.59% | 0.4777 |
| `login-door-recording/frame` | 100.0% | 4.53 | 11.47% | 0.5796 |
| `login-door-recording/Door` | 4.3% | 28.27 | 15.30% | 0.7293 |
| `login-door-recording/Bridges` | 3.9% | 7.33 | 11.16% | 0.5714 |
| `login-door-recording/Towers` | 35.4% | 6.51 | 11.98% | 0.6095 |
| `login-door-recording/Walkway` | 6.9% | 18.06 | 8.22% | 0.6795 |
| `login-door-recording/sky` | 49.5% | 2.38 | 11.24% | 0.5319 |
| `login-door-session/frame` | 100.0% | 0.98 | 8.41% | 0.4567 |
| `login-door-session/Door` | 3.9% | 8.59 | 9.84% | 0.6146 |
| `login-door-session/Bridges` | 1.8% | 11.48 | 5.62% | 0.4901 |
| `login-door-session/Towers` | 52.6% | 4.09 | 7.53% | 0.4262 |
| `login-door-session/Walkway` | 4.6% | 34.94 | 14.59% | 0.7123 |
| `login-door-session/sky` | 37.1% | 5.20 | 8.88% | 0.4502 |
| `login-night-title/frame` | 100.0% | 5.23 | 7.01% | 0.3913 |
| `login-night-title/Bridges` | 2.5% | 18.78 | 7.52% | 0.5165 |
| `login-night-title/Towers` | 37.7% | 10.02 | 7.15% | 0.4150 |
| `login-night-title/Walkway` | 9.9% | 24.29 | 12.27% | 0.6015 |
| `login-night-title/sky` | 49.9% | 6.49 | 5.84% | 0.3257 |
| `mondstadt-city-location/frame` | 100.0% | 18.73 | 22.43% | 0.7549 |
| `mondstadt-city-location/sky` | 100.0% | 18.73 | 22.43% | 0.7549 |
| `nasha-town-location/frame` | 100.0% | 23.93 | 24.60% | 0.7627 |
| `nasha-town-location/sky` | 100.0% | 23.93 | 24.60% | 0.7627 |
| `people-of-the-springs-location/frame` | 100.0% | 24.17 | 21.49% | 0.7945 |
| `people-of-the-springs-location/sky` | 100.0% | 24.17 | 21.49% | 0.7945 |
| `sumeru-city-location/frame` | 100.0% | 19.08 | 28.07% | 0.8157 |
| `sumeru-city-location/sky` | 100.0% | 19.08 | 28.07% | 0.8157 |
| `windrise-statue-day/frame` | 100.0% | 24.21 | 26.74% | 0.7579 |
| `windrise-statue-day/Statue` | 0.8% | 36.64 | 15.11% | 0.6795 |
| `windrise-statue-day/Oak` | 32.5% | 26.13 | 26.59% | 0.7303 |
| `windrise-statue-day/Paving` | 0.5% | 44.17 | 14.32% | 0.7572 |
| `windrise-statue-day/Ground` | 58.8% | 28.43 | 25.14% | 0.7600 |
| `windrise-statue-day/sky` | 7.4% | 42.17 | 42.22% | 0.8708 |
