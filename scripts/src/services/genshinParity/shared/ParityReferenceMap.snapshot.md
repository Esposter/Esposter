# Parity scores

Every reference's last `pnpm -C scripts genshin:parity compare`, which rewrites its own row (`--all` rewrites them
all). The mean difference, the tone and FLIP's perceptual error run from 0 (identical) up; the shape is the share of
the reference's edges the shot shares, 1 identical. Commit it with the change that moved it, as a bench's report is
committed.

| Reference | Screen | Mean difference | Shape | Tone | FLIP |
| :-------- | :----- | --------------: | ----: | ---: | ---: |
| `character-artifacts` | `CharacterScreen` | 10.44% | 0.415 | 6.69% | 0.4314 |
| `character-artifacts-tabs` | `CharacterScreen` | 7.93% | 0.478 | 5.72% | 0.3583 |
| `character-attributes` | `CharacterScreen` | 7.78% | 0.766 | 5.57% | 0.3535 |
| `character-attributes-panel` | `CharacterScreen` | 7.31% | 0.573 | 4.39% | 0.3186 |
| `character-attributes-tabs` | `CharacterScreen` | 6.37% | 0.496 | 5.07% | 0.3096 |
| `character-attributes-top` | `CharacterScreen` | 11.67% | 0.744 | 5.64% | 0.4180 |
| `character-constellation` | `CharacterScreen` | 6.74% | 0.656 | 4.47% | 0.2813 |
| `character-constellation-tabs` | `CharacterScreen` | 5.32% | 0.489 | 3.57% | 0.2054 |
| `character-talents` | `CharacterScreen` | 7.94% | 0.467 | 4.91% | 0.3512 |
| `character-talents-tabs` | `CharacterScreen` | 6.94% | 0.470 | 5.07% | 0.3231 |
| `character-weapons` | `CharacterScreen` | 10.21% | 0.476 | 6.42% | 0.4153 |
| `character-weapons-tabs` | `CharacterScreen` | 7.39% | 0.499 | 5.26% | 0.3384 |
| `dialogue-choices-line` | `DialogueTalk` | 8.66% | 0.917 | 2.09% | 0.2807 |
| `dialogue-choices-replies` | `DialogueTalk` | 15.08% | 0.754 | 8.51% | 0.4770 |
| `dialogue-choices-speaker` | `DialogueTalk` | 8.38% | 0.633 | 4.99% | 0.3228 |
| `dialogue-line` | `DialogueTalk` | 10.47% | 0.981 | 2.29% | 0.3740 |
| `dialogue-paimon-line` | `DialogueTalk` | 9.73% | 0.926 | 3.04% | 0.3121 |
| `everfrozen-earth-location` | `WorldScreen` | 20.11% | 0.239 | 19.70% | 0.6298 |
| `exit-prompt` | `MenuExit` | 8.36% | 0.909 | 33.71% | 0.2227 |
| `handbook-experience` | `HandbookScreen` | 18.12% | 0.173 | 13.29% | 0.5150 |
| `health-notice` | `SplashHealthNotice` | 6.00% | 0.961 | 0.83% | 0.1853 |
| `health-notice-mainland` | `SplashHealthNotice` | 6.88% | 0.834 | 2.70% | 0.2025 |
| `hud-world-pickup` | `HudScreen` | 10.43% | 0.215 | 9.44% | 0.4339 |
| `interaction-prompts-pickup` | `InteractionPromptList` | 9.23% | 0.815 | 5.11% | 0.3833 |
| `inventory-food` | `InventoryScreen` | 3.53% | 0.872 | 2.31% | 0.1942 |
| `inventory-weapons` | `InventoryScreen` | 16.39% | 0.523 | 12.38% | 0.4944 |
| `liyue-harbor-location` | `WorldScreen` | 28.60% | 0.331 | 24.24% | 0.8114 |
| `loading-startup` | `LoadingStartup` | 0.03% | 0.989 | 0.00% | 0.0013 |
| `login-dawn-title` | `LoginScreen` | 10.30% | 0.480 | 7.31% | 0.4135 |
| `login-day-title` | `LoginScreen` | 12.93% | 0.334 | 9.86% | 0.4689 |
| `login-door` | `LoginScreen` | 13.37% | 0.204 | 11.09% | 0.5029 |
| `login-door-recording` | `LoginScreen` | 16.47% | 0.367 | 11.46% | 0.5801 |
| `login-door-session` | `LoginScreen` | 12.26% | 0.419 | 8.41% | 0.4567 |
| `login-interface-door` | `LoginInterface` | 0.63% | 0.986 | 0.43% | 0.0252 |
| `login-interface-loading` | `LoginInterface` | 0.16% | 0.995 | 0.09% | 0.0061 |
| `login-interface-mainland-rating` | `LoginInterface` | 3.85% | 0.953 | 2.62% | 0.2090 |
| `login-interface-title` | `LoginInterface` | 0.34% | 0.997 | 0.24% | 0.0154 |
| `login-night-title` | `LoginScreen` | 9.44% | 0.371 | 7.01% | 0.3917 |
| `map-overlay-jueyun` | `MapOverlay` | 60.22% | 0.123 | 38.81% | 0.8864 |
| `mondstadt-city-location` | `WorldScreen` | 26.18% | 0.306 | 22.30% | 0.7584 |
| `paimon-menu` | `MenuPaimon` | 5.35% | 0.908 | 3.53% | 0.2237 |
| `people-of-the-springs-location` | `WorldScreen` | 24.58% | 0.241 | 21.24% | 0.7965 |
| `publisher-splash` | `SplashPublisher` | 0.07% | 1.000 | 0.01% | 0.0036 |
| `quest-screen` | `QuestScreen` | 55.84% | 0.274 | 53.90% | 0.8998 |
| `settings-graphics` | `MenuSettings` | 2.01% | 1.000 | 1.29% | 0.1037 |
| `title-splash` | `SplashTitle` | 0.20% | 1.000 | 0.01% | 0.0090 |
| `title-splash-mainland` | `SplashTitle` | 1.80% | 0.992 | 0.81% | 0.0787 |
| `windrise-statue-day` | `WorldScreen` | 31.63% | 0.233 | 33.12% | 0.8212 |

## Layers

Each scene's shot scored again over each family of its parts, as the witness's part target lays them at the
reference's view, and over the sky, within the region its row above scores, so its frame is that row: its share of
the region, the CIELab distance between its mean colour and the reference's, and its tone and FLIP, so a family
drawn away from the reference shows on its own row.

| Layer | Coverage | Colour | Tone | FLIP |
| :---- | -------: | -----: | ---: | ---: |
| `everfrozen-earth-location/frame` | 100.0% | 25.51 | 19.70% | 0.6298 |
| `everfrozen-earth-location/sky` | 100.0% | 25.51 | 19.70% | 0.6298 |
| `liyue-harbor-location/frame` | 100.0% | 13.58 | 24.24% | 0.8114 |
| `liyue-harbor-location/sky` | 100.0% | 13.58 | 24.24% | 0.8114 |
| `login-dawn-title/frame` | 100.0% | 4.42 | 7.31% | 0.4135 |
| `login-dawn-title/Bridges` | 2.5% | 6.78 | 7.54% | 0.4917 |
| `login-dawn-title/Towers` | 35.5% | 8.44 | 8.28% | 0.4789 |
| `login-dawn-title/Walkway` | 13.3% | 7.39 | 10.29% | 0.5583 |
| `login-dawn-title/sky` | 48.7% | 2.16 | 5.77% | 0.3222 |
| `login-day-title/frame` | 100.0% | 2.39 | 9.86% | 0.4689 |
| `login-day-title/Bridges` | 1.8% | 1.00 | 4.12% | 0.3986 |
| `login-day-title/Towers` | 55.6% | 4.23 | 11.69% | 0.5342 |
| `login-day-title/Walkway` | 8.5% | 5.18 | 10.16% | 0.4929 |
| `login-day-title/sky` | 34.1% | 1.06 | 7.09% | 0.3603 |
| `login-door/frame` | 100.0% | 8.02 | 11.09% | 0.5029 |
| `login-door/Door` | 13.9% | 18.67 | 14.94% | 0.6836 |
| `login-door/Bridges` | 5.8% | 3.76 | 6.01% | 0.3906 |
| `login-door/Towers` | 26.3% | 1.75 | 8.62% | 0.4706 |
| `login-door/Walkway` | 20.2% | 13.06 | 11.49% | 0.5674 |
| `login-door/sky` | 33.9% | 11.42 | 12.05% | 0.4344 |
| `login-door-recording/frame` | 100.0% | 4.54 | 11.46% | 0.5801 |
| `login-door-recording/Door` | 4.3% | 28.24 | 15.27% | 0.7289 |
| `login-door-recording/Bridges` | 3.9% | 7.30 | 11.16% | 0.5721 |
| `login-door-recording/Towers` | 35.4% | 6.52 | 11.98% | 0.6100 |
| `login-door-recording/Walkway` | 6.9% | 18.05 | 8.22% | 0.6799 |
| `login-door-recording/sky` | 49.5% | 2.39 | 11.24% | 0.5323 |
| `login-door-session/frame` | 100.0% | 0.98 | 8.41% | 0.4567 |
| `login-door-session/Door` | 3.9% | 8.58 | 9.82% | 0.6142 |
| `login-door-session/Bridges` | 1.8% | 11.48 | 5.61% | 0.4903 |
| `login-door-session/Towers` | 52.6% | 4.08 | 7.52% | 0.4260 |
| `login-door-session/Walkway` | 4.6% | 34.96 | 14.60% | 0.7125 |
| `login-door-session/sky` | 37.1% | 5.21 | 8.88% | 0.4503 |
| `login-night-title/frame` | 100.0% | 5.23 | 7.01% | 0.3917 |
| `login-night-title/Bridges` | 2.5% | 18.80 | 7.49% | 0.5169 |
| `login-night-title/Towers` | 37.7% | 10.02 | 7.15% | 0.4151 |
| `login-night-title/Walkway` | 9.9% | 24.32 | 12.28% | 0.6019 |
| `login-night-title/sky` | 49.9% | 6.50 | 5.85% | 0.3263 |
| `mondstadt-city-location/frame` | 100.0% | 18.80 | 22.30% | 0.7584 |
| `mondstadt-city-location/sky` | 100.0% | 18.80 | 22.30% | 0.7584 |
| `people-of-the-springs-location/frame` | 100.0% | 25.75 | 21.24% | 0.7965 |
| `people-of-the-springs-location/sky` | 100.0% | 25.75 | 21.24% | 0.7965 |
| `windrise-statue-day/frame` | 100.0% | 29.36 | 33.12% | 0.8212 |
| `windrise-statue-day/Statue` | 0.8% | 35.43 | 19.17% | 0.7625 |
| `windrise-statue-day/Oak` | 32.9% | 33.57 | 34.05% | 0.8183 |
| `windrise-statue-day/Paving` | 0.5% | 48.15 | 27.53% | 0.8785 |
| `windrise-statue-day/Ground` | 58.8% | 30.80 | 31.84% | 0.8170 |
| `windrise-statue-day/sky` | 7.0% | 42.10 | 41.51% | 0.8725 |
