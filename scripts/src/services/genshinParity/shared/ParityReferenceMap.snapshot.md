# Parity scores

Every reference's last `pnpm -C scripts genshin:parity compare`, which rewrites its own row (`--all` rewrites them
all). The mean difference, the tone and FLIP's perceptual error run from 0 (identical) up; the shape is the share of
the reference's edges the shot shares, 1 identical. Commit it with the change that moved it, as a bench's report is
committed.

| Reference | Screen | Mean difference | Shape | Tone | FLIP |
| :-------- | :----- | --------------: | ----: | ---: | ---: |
| `character-artifacts` | `CharacterScreen` | 10.42% | 0.416 | 6.69% | 0.4314 |
| `character-artifacts-tabs` | `CharacterScreen` | 7.89% | 0.481 | 5.72% | 0.3580 |
| `character-attributes` | `CharacterScreen` | 7.74% | 0.766 | 5.57% | 0.3535 |
| `character-attributes-panel` | `CharacterScreen` | 7.20% | 0.574 | 4.42% | 0.3177 |
| `character-attributes-tabs` | `CharacterScreen` | 6.34% | 0.500 | 5.07% | 0.3094 |
| `character-attributes-top` | `CharacterScreen` | 11.49% | 0.741 | 5.64% | 0.4177 |
| `character-constellation` | `CharacterScreen` | 6.71% | 0.656 | 4.47% | 0.2813 |
| `character-constellation-tabs` | `CharacterScreen` | 5.28% | 0.490 | 3.57% | 0.2051 |
| `character-talents` | `CharacterScreen` | 7.92% | 0.468 | 4.91% | 0.3511 |
| `character-talents-tabs` | `CharacterScreen` | 6.91% | 0.473 | 5.07% | 0.3227 |
| `character-weapons` | `CharacterScreen` | 10.19% | 0.479 | 6.42% | 0.4153 |
| `character-weapons-tabs` | `CharacterScreen` | 7.35% | 0.503 | 5.26% | 0.3381 |
| `court-of-fontaine-location` | `WorldScreen` | 31.74% | 0.202 | 27.65% | 0.8417 |
| `dialogue-choices-line` | `DialogueTalk` | 9.22% | 0.934 | 1.91% | 0.2912 |
| `dialogue-choices-replies` | `DialogueTalk` | 14.34% | 0.756 | 8.55% | 0.4678 |
| `dialogue-choices-speaker` | `DialogueTalk` | 7.79% | 0.613 | 4.88% | 0.3167 |
| `dialogue-line` | `DialogueTalk` | 10.80% | 0.982 | 2.06% | 0.3844 |
| `dialogue-paimon-line` | `DialogueTalk` | 9.98% | 0.957 | 2.60% | 0.3151 |
| `everfrozen-earth-location` | `WorldScreen` | 20.61% | 0.234 | 19.75% | 0.6327 |
| `exit-prompt` | `MenuExit` | 8.36% | 0.909 | 33.71% | 0.2227 |
| `handbook-experience` | `HandbookScreen` | 18.12% | 0.173 | 13.29% | 0.5150 |
| `health-notice` | `SplashHealthNotice` | 6.00% | 0.961 | 0.83% | 0.1853 |
| `health-notice-mainland` | `SplashHealthNotice` | 6.88% | 0.834 | 2.70% | 0.2025 |
| `hud-world-pickup` | `HudScreen` | 10.39% | 0.215 | 9.44% | 0.4337 |
| `interaction-prompts-pickup` | `InteractionPromptList` | 8.93% | 0.848 | 5.11% | 0.3793 |
| `inventory-food` | `InventoryScreen` | 3.44% | 0.873 | 2.31% | 0.1928 |
| `inventory-weapons` | `InventoryScreen` | 16.34% | 0.523 | 12.38% | 0.4942 |
| `liyue-harbor-location` | `WorldScreen` | 29.33% | 0.303 | 24.45% | 0.8094 |
| `loading-startup` | `LoadingStartup` | 0.03% | 0.989 | 0.00% | 0.0013 |
| `login-dawn-title` | `LoginScreen` | 10.30% | 0.479 | 7.30% | 0.4135 |
| `login-day-title` | `LoginScreen` | 12.93% | 0.333 | 9.86% | 0.4689 |
| `login-door` | `LoginScreen` | 13.37% | 0.204 | 11.09% | 0.5029 |
| `login-door-recording` | `LoginScreen` | 16.44% | 0.366 | 11.47% | 0.5796 |
| `login-door-session` | `LoginScreen` | 12.25% | 0.417 | 8.41% | 0.4567 |
| `login-interface-door` | `LoginInterface` | 0.75% | 0.985 | 0.44% | 0.0459 |
| `login-interface-loading` | `LoginInterface` | 0.34% | 0.995 | 0.11% | 0.0285 |
| `login-interface-mainland-rating` | `LoginInterface` | 3.85% | 0.953 | 2.62% | 0.2090 |
| `login-interface-title` | `LoginInterface` | 0.51% | 0.997 | 0.25% | 0.0353 |
| `login-night-title` | `LoginScreen` | 9.41% | 0.371 | 7.01% | 0.3913 |
| `map-overlay-jueyun` | `MapOverlay` | 60.22% | 0.123 | 38.81% | 0.8864 |
| `mondstadt-city-location` | `WorldScreen` | 26.66% | 0.292 | 22.43% | 0.7549 |
| `nasha-town-location` | `WorldScreen` | 29.69% | 0.238 | 24.60% | 0.7627 |
| `paimon-menu` | `MenuPaimon` | 5.35% | 0.908 | 3.53% | 0.2237 |
| `people-of-the-springs-location` | `WorldScreen` | 25.06% | 0.223 | 21.49% | 0.7945 |
| `publisher-splash` | `SplashPublisher` | 0.07% | 1.000 | 0.01% | 0.0036 |
| `quest-screen` | `QuestScreen` | 55.84% | 0.274 | 53.90% | 0.8998 |
| `settings-graphics` | `MenuSettings` | 2.01% | 1.000 | 1.29% | 0.1037 |
| `sumeru-city-location` | `WorldScreen` | 32.42% | 0.227 | 28.07% | 0.8157 |
| `title-splash` | `SplashTitle` | 0.20% | 1.000 | 0.01% | 0.0090 |
| `title-splash-mainland` | `SplashTitle` | 1.80% | 0.992 | 0.81% | 0.0787 |
| `windrise-statue-day` | `WorldScreen` | 28.46% | 0.229 | 29.94% | 0.7878 |

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
| `login-door/frame` | 100.0% | 8.02 | 11.09% | 0.5029 |
| `login-door/Door` | 13.9% | 18.67 | 14.94% | 0.6836 |
| `login-door/Bridges` | 5.8% | 3.76 | 6.01% | 0.3906 |
| `login-door/Towers` | 26.3% | 1.75 | 8.62% | 0.4706 |
| `login-door/Walkway` | 20.2% | 13.06 | 11.49% | 0.5674 |
| `login-door/sky` | 33.9% | 11.42 | 12.05% | 0.4344 |
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
| `windrise-statue-day/frame` | 100.0% | 29.33 | 29.94% | 0.7878 |
| `windrise-statue-day/Statue` | 0.8% | 30.11 | 14.41% | 0.6782 |
| `windrise-statue-day/Oak` | 32.9% | 34.36 | 33.48% | 0.7807 |
| `windrise-statue-day/Paving` | 0.5% | 46.13 | 16.07% | 0.7791 |
| `windrise-statue-day/Ground` | 58.8% | 31.73 | 26.92% | 0.7835 |
| `windrise-statue-day/sky` | 7.0% | 41.87 | 41.47% | 0.8694 |
