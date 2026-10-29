# Parity scores

Every reference's last `pnpm -C scripts genshin:parity compare`, which rewrites its own row (`--all` rewrites them
all). The mean difference, the tone and FLIP's perceptual error run from 0 (identical) up; the shape is the share of
the reference's edges the shot shares, 1 identical. Commit it with the change that moved it, as a bench's report is
committed.

| Reference                              | Screen                      |                                                                Mean difference | Shape |   Tone |   FLIP |
| :------------------------------------- | :-------------------------- | -----------------------------------------------------------------------------: | ----: | -----: | -----: |
| `archive-screen`                       | `ArchiveScreen`             |                                                                          9.97% | 0.899 |  2.17% | 0.3457 |
| `character-artifacts`                  | `CharacterScreen`           |                                                                          2.88% | 0.924 |  0.90% | 0.1225 |
| `character-artifacts-tabs`             | `CharacterScreen`           |                                                                          0.88% | 0.976 |  0.32% | 0.0474 |
| `character-attributes`                 | `CharacterScreen`           |                                                                          1.70% | 0.966 |  0.61% | 0.0703 |
| `character-attributes-panel`           | `CharacterScreen`           |                                                                          3.68% | 0.859 |  1.88% | 0.1547 |
| `character-attributes-tabs`            | `CharacterScreen`           |                                                                          0.97% | 0.985 |  0.34% | 0.0441 |
| `character-attributes-top`             | `CharacterScreen`           |                                                                          8.09% | 0.836 |  2.22% | 0.3151 |
| `character-constellation`              | `CharacterScreen`           |                                                                          1.97% | 0.895 |  0.91% | 0.0771 |
| `character-constellation-tabs`         | `CharacterScreen`           |                                                                          1.31% | 0.979 |  0.44% | 0.0478 |
| `character-talents`                    | `CharacterScreen`           |                                                                          1.82% | 0.903 |  0.66% | 0.0798 |
| `character-talents-tabs`               | `CharacterScreen`           |                                                                          0.89% | 0.978 |  0.28% | 0.0466 |
| `character-weapons`                    | `CharacterScreen`           |                                                                          2.47% | 0.889 |  1.37% | 0.1063 |
| `character-weapons-tabs`               | `CharacterScreen`           |                                                                          0.89% | 0.976 |  0.30% | 0.0453 |
| `cooking-screen`                       | `CookingScreen`             |                                                                          1.17% | 0.938 |  0.53% | 0.0540 |
| `court-of-fontaine-location`           | `WorldScreen`               |                                                                         21.07% | 0.208 | 16.61% | 0.6768 |
| `crafting-strongbox`                   | `CraftingStrongbox`         |                                       pending: no screenshot of the screen yet |       |        |        |
| `crafting-table`                       | `CraftingScreen`            |                                          pending: its recording is not on disk |       |        |        |
| `dialogue-choices-line`                | `DialogueTalk`              |                                                                          8.99% | 0.924 |  2.15% | 0.2757 |
| `dialogue-choices-replies`             | `DialogueTalk`              |                                                                         13.45% | 0.814 |  8.33% | 0.4455 |
| `dialogue-choices-speaker`             | `DialogueTalk`              |                                                                          6.37% | 0.798 |  4.63% | 0.2878 |
| `dialogue-line`                        | `DialogueTalk`              |                                                                         10.61% | 0.982 |  2.29% | 0.3704 |
| `dialogue-paimon-line`                 | `DialogueTalk`              |                                                                          9.67% | 0.949 |  3.35% | 0.2930 |
| `everfrozen-earth-location`            | `WorldScreen`               |                                                                         20.61% | 0.234 | 19.75% | 0.6327 |
| `exit-prompt`                          | `MenuExit`                  |                                                                          1.59% | 0.999 |  1.24% | 0.1205 |
| `expedition-screen`                    | `ExpeditionScreen`          |                                                                          1.56% | 0.934 |  0.44% | 0.0672 |
| `fishing-screen`                       | `FishingScreen`             |                                                                          0.05% | 0.998 |  0.03% | 0.0035 |
| `forge-screen`                         | `ForgeScreen`               |                                                                          3.67% | 0.776 |  1.84% | 0.1541 |
| `forge-screen-ores-done`               | `ForgeScreen`               |                                                                          2.96% | 0.837 |  1.70% | 0.1389 |
| `forge-screen-queues`                  | `ForgeScreen`               |                                                                          3.44% | 0.771 |  1.88% | 0.1582 |
| `forge-screen-refused`                 | `ForgeScreen`               |                                     pending: no screenshot of this variant yet |       |        |        |
| `forge-screen-weapons-done`            | `ForgeScreen`               |                                     pending: no screenshot of this variant yet |       |        |        |
| `gcg-duel-board`                       | `GcgScreen`                 |                                                                          8.21% | 0.563 |  3.98% | 0.3227 |
| `handbook-experience`                  | `HandbookScreen`            |                                                                          4.18% | 0.958 |  1.97% | 0.2111 |
| `health-notice`                        | `SplashHealthNotice`        |                                                                          6.17% | 0.964 |  1.51% | 0.1780 |
| `health-notice-japanese`               | `SplashHealthNotice`        |                                                                          8.38% | 0.873 |  1.54% | 0.2395 |
| `health-notice-mainland`               | `SplashHealthNotice`        |                                                                          4.71% | 0.960 |  1.19% | 0.1419 |
| `hud-paimon-button`                    | `HudScreen`                 |                                                                          1.63% | 0.914 |  2.23% | 0.0940 |
| `hud-stamina-climb`                    | `HudScreen`                 |                                                                          0.62% | 0.787 |  0.75% | 0.0629 |
| `hud-world-keys`                       | `HudScreen`                 |                                                                          2.07% | 0.983 |  1.52% | 0.1296 |
| `hud-world-pickup`                     | `HudScreen`                 |                                                                          2.79% | 0.769 |  1.50% | 0.1323 |
| `interaction-prompts-jueyun-chili`     | `InteractionPromptList`     |                                                                          4.63% | 0.954 |  1.79% | 0.2034 |
| `interaction-prompts-pickup`           | `InteractionPromptList`     |                                                                          5.07% | 0.937 |  2.64% | 0.2181 |
| `inventory-food`                       | `InventoryScreen`           |                                                                          2.99% | 0.994 |  1.95% | 0.1850 |
| `inventory-weapons`                    | `InventoryScreen`           |                                                                          9.79% | 0.635 |  6.39% | 0.3665 |
| `liyue-harbor-location`                | `WorldScreen`               |                                                                         29.33% | 0.303 | 24.45% | 0.8094 |
| `loading-startup`                      | `LoadingStartup`            |                                                                          0.07% | 0.765 |  0.04% | 0.0027 |
| `login-dawn-title`                     | `LoginScreen`               |                                                                         10.29% | 0.478 |  7.31% | 0.4134 |
| `login-day-title`                      | `LoginScreen`               |                                                                         12.93% | 0.334 |  9.86% | 0.4689 |
| `login-door`                           | `LoginScreen`               |                                                                         13.37% | 0.204 | 11.09% | 0.5029 |
| `login-door-recording`                 | `LoginScreen`               |                                                                         16.44% | 0.366 | 11.47% | 0.5796 |
| `login-door-session`                   | `LoginScreen`               |                                                                         12.25% | 0.417 |  8.41% | 0.4567 |
| `login-interface-arriving`             | `LoginInterface`            |                                     pending: no screenshot of this variant yet |       |        |        |
| `login-interface-door`                 | `LoginInterface`            |                                                                          0.46% | 0.992 |  0.20% | 0.0381 |
| `login-interface-door-mainland`        | `LoginInterface`            |                                                                          0.57% | 0.975 |  0.38% | 0.0288 |
| `login-interface-loading`              | `LoginInterface`            |                                                                          0.28% | 0.994 |  0.13% | 0.0250 |
| `login-interface-loading-game`         | `LoginInterface`            |                                     pending: no screenshot of this variant yet |       |        |        |
| `login-interface-mainland-rating`      | `LoginInterface`            |                                                                          3.01% | 0.992 |  2.34% | 0.1915 |
| `login-interface-title`                | `LoginInterface`            |                                                                          0.36% | 0.996 |  0.24% | 0.0158 |
| `login-night-title`                    | `LoginScreen`               |                                                                          9.42% | 0.369 |  7.03% | 0.3920 |
| `login-screen-dusk`                    | `LoginScreen`               |                                                                         19.47% | 0.364 | 13.94% | 0.6476 |
| `map-overlay-galesong`                 | `MapOverlay`                |                                                                          6.51% | 0.747 | 21.89% | 0.4779 |
| `map-overlay-jueyun`                   | `MapOverlay`                |                                                                         26.26% | 0.389 | 24.06% | 0.7516 |
| `menu-exit-hover`                      | `MenuExit`                  |                                                                          1.69% | 0.999 |  1.32% | 0.1237 |
| `menu-exit-pressed`                    | `MenuExit`                  |                                                                          1.59% | 0.996 |  1.29% | 0.1233 |
| `menu-paimon-disabled`                 | `MenuPaimon`                |                                     pending: no screenshot of this variant yet |       |        |        |
| `menu-paimon-hover`                    | `MenuPaimon`                |                                     pending: no screenshot of this variant yet |       |        |        |
| `menu-paimon-pressed`                  | `MenuPaimon`                |                                     pending: no screenshot of this variant yet |       |        |        |
| `menu-time`                            | `MenuTime`                  |                                                                          1.34% | 0.927 |  1.12% | 0.0323 |
| `menu-world-level-prompt`              | `MenuWorldLevelPrompt`      |                                       pending: no screenshot of the screen yet |       |        |        |
| `menu-world-level-prompt-hover`        | `MenuWorldLevelPrompt`      |                                     pending: no screenshot of this variant yet |       |        |        |
| `menu-world-level-prompt-pressed`      | `MenuWorldLevelPrompt`      |                                     pending: no screenshot of this variant yet |       |        |        |
| `menu-world-level-prompt-revert`       | `MenuWorldLevelPrompt`      |                                     pending: no screenshot of this variant yet |       |        |        |
| `mondstadt-city-location`              | `WorldScreen`               |                                                                         26.66% | 0.292 | 22.43% | 0.7549 |
| `nasha-town-location`                  | `WorldScreen`               |                                                                         29.69% | 0.238 | 24.60% | 0.7627 |
| `paimon-menu`                          | `MenuPaimon`                |                                                                          3.73% | 0.930 |  1.92% | 0.2058 |
| `party-screen`                         | `PartyScreen`               |                                                                          4.27% | 0.366 |  2.51% | 0.1588 |
| `people-of-the-springs-location`       | `WorldScreen`               |                                                                         25.06% | 0.223 | 21.49% | 0.7945 |
| `publisher-splash`                     | `SplashPublisher`           |                                                                          0.07% | 1.000 |  0.01% | 0.0036 |
| `quest-screen`                         | `QuestScreen`               |                                                                          9.59% | 0.844 |  7.82% | 0.3511 |
| `quest-screen-details`                 | `QuestScreen`               |                                                                         13.97% | 0.946 | 12.85% | 0.4368 |
| `quest-screen-header`                  | `QuestScreen`               |                                                                          3.37% | 0.999 |  2.70% | 0.1857 |
| `quest-screen-list`                    | `QuestScreen`               |                                                                          6.18% | 0.892 |  4.70% | 0.2657 |
| `reputation-screen`                    | `ReputationScreen`          |                                                                          1.99% | 0.875 |  1.39% | 0.1429 |
| `settings-audio-rows`                  | `MenuSettings`              |                                                                          1.01% | 0.997 |  0.38% | 0.0742 |
| `settings-graphics`                    | `MenuSettings`              |                                                                          1.56% | 0.996 |  1.26% | 0.1010 |
| `settings-graphics-rows`               | `MenuSettings`              |                                                                          1.07% | 0.998 |  0.41% | 0.0888 |
| `spiral-abyss-benediction`             | `SpiralAbyssBenediction`    |                                                                          1.70% | 0.979 |  0.48% | 0.0696 |
| `spiral-abyss-entry`                   | `SpiralAbyssEntry`          |                                       pending: no screenshot of the screen yet |       |        |        |
| `splash-title-chinese-traditional`     | `SplashTitle`               |                                     pending: no screenshot of this variant yet |       |        |        |
| `splash-title-japanese`                | `SplashTitle`               |                                                                          0.16% | 1.000 |  0.39% | 0.0342 |
| `splash-title-korean`                  | `SplashTitle`               |                                     pending: no screenshot of this variant yet |       |        |        |
| `sumeru-city-location`                 | `WorldScreen`               |                                                                         32.42% | 0.227 | 28.07% | 0.8157 |
| `title-splash`                         | `SplashTitle`               |                                                                          0.20% | 1.000 |  0.01% | 0.0089 |
| `title-splash-mainland`                | `SplashTitle`               |                                                                          1.89% | 0.991 |  0.89% | 0.0807 |
| `weapon-screen`                        | `WeaponScreen`              |                                                                          2.00% | 0.897 |  0.94% | 0.0832 |
| `weapon-screen-ascend`                 | `WeaponScreen`              |                                                                          1.86% | 0.827 |  0.86% | 0.0741 |
| `weapon-screen-at-cap`                 | `WeaponScreen`              | pending: the recording zooms over the state, so no whole-screen frame shows it |       |        |        |
| `weapon-screen-rank-five`              | `WeaponScreen`              |                                     pending: no screenshot of this variant yet |       |        |        |
| `weapon-screen-refine`                 | `WeaponScreen`              |                                                                          2.40% | 0.941 |  0.59% | 0.0875 |
| `weapon-screen-two-star`               | `WeaponScreen`              |                                     pending: no screenshot of this variant yet |       |        |        |
| `windrise-statue-day`                  | `WorldScreen`               |                                                                         26.73% | 0.306 | 26.74% | 0.7579 |
| `wish-screen`                          | `WishScreen`                |                                                                          9.21% | 0.626 |  6.29% | 0.2802 |
| `world-level-dialog`                   | `MenuWorldLevelDialog`      |                                                                          5.79% | 0.864 |  1.71% | 0.1923 |
| `world-realm-placement-editor`         | `WorldRealmPlacementEditor` |                                       pending: no screenshot of the screen yet |       |        |        |
| `world-realm-placement-editor-at-load` | `WorldRealmPlacementEditor` |                                     pending: no screenshot of this variant yet |       |        |        |

## Layers

Each scene's shot scored again over each family of its parts, as the witness's part target lays them at the
reference's view, and over the sky, within the region its row above scores, so its frame is that row: its share of
the region, the CIELab distance between its mean colour and the reference's, and its tone and FLIP, so a family
drawn away from the reference shows on its own row.

| Layer                                  | Coverage | Colour |   Tone |   FLIP |
| :------------------------------------- | -------: | -----: | -----: | -----: |
| `court-of-fontaine-location/frame`     |   100.0% |  15.06 | 16.61% | 0.6768 |
| `court-of-fontaine-location/sky`       |   100.0% |  15.06 | 16.61% | 0.6768 |
| `everfrozen-earth-location/frame`      |   100.0% |  25.50 | 19.75% | 0.6327 |
| `everfrozen-earth-location/sky`        |   100.0% |  25.50 | 19.75% | 0.6327 |
| `liyue-harbor-location/frame`          |   100.0% |  14.10 | 24.45% | 0.8094 |
| `liyue-harbor-location/sky`            |   100.0% |  14.10 | 24.45% | 0.8094 |
| `login-dawn-title/frame`               |   100.0% |   4.42 |  7.31% | 0.4134 |
| `login-dawn-title/Walkway`             |    13.3% |   7.39 | 10.29% | 0.5578 |
| `login-dawn-title/Bridges`             |     2.5% |   6.80 |  7.56% | 0.4908 |
| `login-dawn-title/Towers`              |    35.5% |   8.45 |  8.29% | 0.4788 |
| `login-dawn-title/sky`                 |    48.7% |   2.17 |  5.78% | 0.3222 |
| `login-day-title/frame`                |   100.0% |   2.41 |  9.86% | 0.4689 |
| `login-day-title/Walkway`              |     8.5% |   5.18 | 10.16% | 0.4928 |
| `login-day-title/Bridges`              |     1.8% |   1.01 |  4.12% | 0.3983 |
| `login-day-title/Towers`               |    55.6% |   4.26 | 11.70% | 0.5342 |
| `login-day-title/sky`                  |    34.1% |   1.07 |  7.10% | 0.3603 |
| `login-door/frame`                     |   100.0% |   8.01 | 11.09% | 0.5029 |
| `login-door/Walkway`                   |    20.4% |  13.08 | 11.50% | 0.5684 |
| `login-door/Bridges`                   |     8.3% |   9.40 |  8.46% | 0.4851 |
| `login-door/Towers`                    |    30.1% |   1.19 |  9.48% | 0.4979 |
| `login-door/sky`                       |    41.3% |  12.05 | 12.59% | 0.4777 |
| `login-door-recording/frame`           |   100.0% |   4.53 | 11.47% | 0.5796 |
| `login-door-recording/Door`            |     4.3% |  28.27 | 15.30% | 0.7293 |
| `login-door-recording/Bridges`         |     3.9% |   7.33 | 11.16% | 0.5714 |
| `login-door-recording/Towers`          |    35.4% |   6.51 | 11.98% | 0.6095 |
| `login-door-recording/Walkway`         |     6.9% |  18.06 |  8.22% | 0.6795 |
| `login-door-recording/sky`             |    49.5% |   2.38 | 11.24% | 0.5319 |
| `login-door-session/frame`             |   100.0% |   0.98 |  8.41% | 0.4567 |
| `login-door-session/Door`              |     3.9% |   8.59 |  9.84% | 0.6146 |
| `login-door-session/Bridges`           |     1.8% |  11.48 |  5.62% | 0.4901 |
| `login-door-session/Towers`            |    52.6% |   4.09 |  7.53% | 0.4262 |
| `login-door-session/Walkway`           |     4.6% |  34.94 | 14.59% | 0.7123 |
| `login-door-session/sky`               |    37.1% |   5.20 |  8.88% | 0.4502 |
| `login-night-title/frame`              |   100.0% |   5.36 |  7.03% | 0.3920 |
| `login-night-title/Walkway`            |     9.9% |  24.30 | 12.26% | 0.6014 |
| `login-night-title/Bridges`            |     2.5% |  18.98 |  7.55% | 0.5184 |
| `login-night-title/Towers`             |    37.7% |  10.13 |  7.17% | 0.4156 |
| `login-night-title/sky`                |    49.9% |   6.67 |  5.86% | 0.3266 |
| `mondstadt-city-location/frame`        |   100.0% |  18.73 | 22.43% | 0.7549 |
| `mondstadt-city-location/sky`          |   100.0% |  18.73 | 22.43% | 0.7549 |
| `nasha-town-location/frame`            |   100.0% |  23.93 | 24.60% | 0.7627 |
| `nasha-town-location/sky`              |   100.0% |  23.93 | 24.60% | 0.7627 |
| `people-of-the-springs-location/frame` |   100.0% |  24.17 | 21.49% | 0.7945 |
| `people-of-the-springs-location/sky`   |   100.0% |  24.17 | 21.49% | 0.7945 |
| `sumeru-city-location/frame`           |   100.0% |  19.08 | 28.07% | 0.8157 |
| `sumeru-city-location/sky`             |   100.0% |  19.08 | 28.07% | 0.8157 |
| `windrise-statue-day/frame`            |   100.0% |  24.21 | 26.74% | 0.7579 |
| `windrise-statue-day/Statue`           |     0.8% |  36.64 | 15.11% | 0.6795 |
| `windrise-statue-day/Oak`              |    32.5% |  26.13 | 26.59% | 0.7303 |
| `windrise-statue-day/Paving`           |     0.5% |  44.17 | 14.32% | 0.7572 |
| `windrise-statue-day/Ground`           |    58.8% |  28.43 | 25.14% | 0.7600 |
| `windrise-statue-day/sky`              |     7.4% |  42.17 | 42.22% | 0.8708 |
