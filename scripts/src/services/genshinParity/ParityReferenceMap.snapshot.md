# Parity scores

Every reference's last `pnpm -C scripts genshin:parity compare`, which rewrites its own row (`--all` rewrites them
all). The mean difference, the tone and FLIP's perceptual error run from 0 (identical) up; the shape is the share of
the reference's edges the shot shares, 1 identical. Commit it with the change that moved it, as a bench's report is
committed.

| Reference | Screen | Mean difference | Shape | Tone | FLIP |
| :-------- | :----- | --------------: | ----: | ---: | ---: |
| `health-notice` | `SplashHealthNotice` | 6.50% | 0.972 | 1.15% | 0.2067 |
| `loading-startup` | `LoadingStartup` | 0.03% | 0.989 | 0.00% | 0.0013 |
| `login-dawn-title` | `LoginScreen` | 14.89% | 0.421 | 11.85% | 0.5222 |
| `login-day-title` | `LoginScreen` | 15.10% | 0.394 | 12.82% | 0.5072 |
| `login-door` | `LoginScreen` | 10.82% | 0.265 | 9.98% | 0.4627 |
| `login-door-recording` | `LoginScreen` | 17.36% | 0.388 | 12.36% | 0.5956 |
| `login-interface-door` | `LoginInterface` | 0.63% | 0.986 | 0.43% | 0.0252 |
| `login-interface-loading` | `LoginInterface` | 0.16% | 0.995 | 0.09% | 0.0061 |
| `login-interface-mainland-rating` | `LoginInterface` | 3.44% | 0.959 | 2.39% | 0.1444 |
| `login-interface-title` | `LoginInterface` | 0.35% | 0.997 | 0.23% | 0.0155 |
| `login-night-title` | `LoginScreen` | 13.68% | 0.412 | 11.91% | 0.4922 |
| `publisher-splash` | `SplashPublisher` | 0.46% | 1.000 | 0.77% | 0.0471 |
| `title-splash` | `SplashTitle` | 1.27% | 1.000 | 0.25% | 0.0465 |
| `title-splash-mainland` | `SplashTitle` | 1.45% | 0.992 | 0.18% | 0.0383 |
