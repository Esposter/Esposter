# Parity scores

Every reference's last `pnpm -C scripts genshin:parity compare`, which rewrites its own row (`--all` rewrites them
all). The mean difference, the tone and FLIP's perceptual error run from 0 (identical) up; the shape is the share of
the reference's edges the shot shares, 1 identical. Commit it with the change that moved it, as a bench's report is
committed.

| Reference | Screen | Mean difference | Shape | Tone | FLIP |
| :-------- | :----- | --------------: | ----: | ---: | ---: |
| `handbook-experience` | `HandbookScreen` | 18.12% | 0.173 | 13.29% | 0.5150 |
| `health-notice` | `SplashHealthNotice` | 6.00% | 0.961 | 0.83% | 0.1853 |
| `health-notice-mainland` | `SplashHealthNotice` | 6.88% | 0.834 | 2.70% | 0.2025 |
| `hud-world-pickup` | `HudScreen` | 0.95% | 0.942 | 0.73% | 0.0488 |
| `interaction-prompts-pickup` | `InteractionPromptList` | 8.27% | 0.887 | 4.08% | 0.2813 |
| `inventory-weapons` | `InventoryScreen` | 9.14% | 0.612 | 7.41% | 0.3080 |
| `loading-startup` | `LoadingStartup` | 0.03% | 0.989 | 0.00% | 0.0013 |
| `login-dawn-title` | `LoginScreen` | 10.34% | 0.468 | 7.35% | 0.4133 |
| `login-day-title` | `LoginScreen` | 12.92% | 0.336 | 9.86% | 0.4688 |
| `login-door` | `LoginScreen` | 13.37% | 0.205 | 11.08% | 0.5030 |
| `login-door-recording` | `LoginScreen` | 16.84% | 0.368 | 11.81% | 0.5886 |
| `login-door-session` | `LoginScreen` | 12.69% | 0.405 | 9.01% | 0.4657 |
| `login-interface-door` | `LoginInterface` | 0.63% | 0.986 | 0.43% | 0.0252 |
| `login-interface-loading` | `LoginInterface` | 0.16% | 0.995 | 0.09% | 0.0061 |
| `login-interface-mainland-rating` | `LoginInterface` | 2.11% | 0.959 | 1.12% | 0.1095 |
| `login-interface-title` | `LoginInterface` | 0.34% | 0.997 | 0.24% | 0.0154 |
| `login-night-title` | `LoginScreen` | 11.16% | 0.358 | 8.40% | 0.4231 |
| `map-overlay-jueyun` | `MapOverlay` | 31.37% | 0.072 | 30.13% | 0.7918 |
| `paimon-menu` | `MenuPaimon` | 5.35% | 0.908 | 3.53% | 0.2237 |
| `publisher-splash` | `SplashPublisher` | 0.07% | 1.000 | 0.01% | 0.0036 |
| `quest-screen` | `QuestScreen` | 55.84% | 0.274 | 53.90% | 0.8998 |
| `settings-graphics` | `MenuSettings` | 2.01% | 1.000 | 1.29% | 0.1037 |
| `title-splash` | `SplashTitle` | 0.20% | 1.000 | 0.01% | 0.0090 |
| `title-splash-mainland` | `SplashTitle` | 1.80% | 0.992 | 0.81% | 0.0787 |
| `windrise-statue-day` | `WorldScreen` | 43.15% | 0.161 | 45.35% | 0.8676 |

## Layers

Each scene's shot scored again over each family of its parts, as the witness's part target lays them at the
reference's view, and over the sky, within the region its row above scores, so its frame is that row: its share of
the region, the CIELab distance between its mean colour and the reference's, and its tone and FLIP, so a family
drawn away from the reference shows on its own row.

| Layer | Coverage | Colour | Tone | FLIP |
| :---- | -------: | -----: | ---: | ---: |
| `login-dawn-title/frame` | 100.0% | 4.15 | 7.35% | 0.4133 |
| `login-dawn-title/Bridges` | 2.5% | 6.74 | 7.57% | 0.4918 |
| `login-dawn-title/Towers` | 35.5% | 7.87 | 8.39% | 0.4779 |
| `login-dawn-title/Walkway` | 13.3% | 7.39 | 10.29% | 0.5583 |
| `login-dawn-title/sky` | 48.7% | 2.12 | 5.78% | 0.3226 |
| `login-day-title/frame` | 100.0% | 4.68 | 14.71% | 0.5134 |
| `login-day-title/Bridges` | 1.6% | 1.08 | 4.14% | 0.3972 |
| `login-day-title/Towers` | 53.6% | 5.87 | 15.45% | 0.5601 |
| `login-day-title/Walkway` | 10.2% | 9.16 | 26.88% | 0.6166 |
| `login-day-title/sky` | 34.6% | 2.58 | 10.47% | 0.4159 |
| `login-door/frame` | 100.0% | 5.50 | 9.67% | 0.4800 |
| `login-door/Door` | 2.4% | 18.68 | 13.10% | 0.6948 |
| `login-door/Bridges` | 2.5% | 3.57 | 4.86% | 0.4278 |
| `login-door/Towers` | 27.4% | 3.82 | 9.95% | 0.5474 |
| `login-door/Walkway` | 14.0% | 11.02 | 10.88% | 0.6040 |
| `login-door/sky` | 53.7% | 5.29 | 9.28% | 0.4061 |
| `login-door-recording/frame` | 100.0% | 5.47 | 11.81% | 0.5886 |
| `login-door-recording/Door` | 4.3% | 30.50 | 17.50% | 0.7711 |
| `login-door-recording/Bridges` | 3.9% | 8.91 | 11.62% | 0.5856 |
| `login-door-recording/Towers` | 35.4% | 8.54 | 12.39% | 0.6273 |
| `login-door-recording/Walkway` | 6.9% | 18.03 | 8.97% | 0.6805 |
| `login-door-recording/sky` | 49.5% | 2.43 | 11.30% | 0.5324 |
| `login-door-session/frame` | 100.0% | 1.98 | 9.01% | 0.4657 |
| `login-door-session/Door` | 3.9% | 4.06 | 7.84% | 0.5739 |
| `login-door-session/Bridges` | 1.8% | 14.33 | 8.41% | 0.5314 |
| `login-door-session/Towers` | 52.6% | 4.32 | 8.31% | 0.4393 |
| `login-door-session/Walkway` | 4.6% | 39.26 | 14.92% | 0.7421 |
| `login-door-session/sky` | 37.1% | 5.82 | 9.43% | 0.4545 |
| `login-night-title/frame` | 100.0% | 6.08 | 8.40% | 0.4231 |
| `login-night-title/Bridges` | 2.5% | 21.53 | 12.12% | 0.5853 |
| `login-night-title/Towers` | 37.7% | 9.57 | 8.51% | 0.4547 |
| `login-night-title/Walkway` | 9.9% | 28.49 | 12.68% | 0.6356 |
| `login-night-title/sky` | 49.9% | 8.72 | 7.29% | 0.3492 |
| `windrise-statue-day/frame` | 100.0% | 37.19 | 45.35% | 0.8583 |
| `windrise-statue-day/Statue` | 0.7% | 55.31 | 0.00% | 0.9080 |
| `windrise-statue-day/Oak` | 36.5% | 59.74 | 48.50% | 0.9495 |
| `windrise-statue-day/Paving` | 0.4% | 26.44 | 0.00% | 0.6628 |
| `windrise-statue-day/Ground` | 52.8% | 29.14 | 0.00% | 0.7989 |
| `windrise-statue-day/sky` | 9.6% | 37.11 | 34.56% | 0.8423 |
