# Parity scores

Every reference's last `pnpm -C scripts genshin:parity compare`, which rewrites its own row (`--all` rewrites them
all). The mean difference, the tone and FLIP's perceptual error run from 0 (identical) up; the shape is the share of
the reference's edges the shot shares, 1 identical. Commit it with the change that moved it, as a bench's report is
committed.

| Reference | Screen | Mean difference | Shape | Tone | FLIP |
| :-------- | :----- | --------------: | ----: | ---: | ---: |
| `health-notice` | `SplashHealthNotice` | 6.50% | 0.972 | 1.15% | 0.2067 |
| `loading-startup` | `LoadingStartup` | 0.03% | 0.989 | 0.00% | 0.0013 |
| `login-dawn` | `LoginScreen` | 17.86% | 0.190 | 14.00% | 0.5852 |
| `login-day` | `LoginScreen` | 15.84% | 0.368 | 11.48% | 0.5343 |
| `login-door` | `LoginScreen` | 10.37% | 0.207 | 9.63% | 0.4620 |
| `login-door-recording` | `LoginScreen` | 18.55% | 0.328 | 13.68% | 0.6108 |
| `login-dusk` | `LoginScreen` | 21.29% | 0.267 | 15.72% | 0.6536 |
| `login-interface-door` | `LoginInterface` | 0.63% | 0.986 | 0.43% | 0.0252 |
| `login-interface-loading` | `LoginInterface` | 0.16% | 0.995 | 0.09% | 0.0061 |
| `login-interface-title` | `LoginInterface` | 0.35% | 0.997 | 0.23% | 0.0155 |
| `login-night` | `LoginScreen` | 13.98% | 0.291 | 10.86% | 0.4974 |
| `publisher-splash` | `SplashPublisher` | 0.46% | 1.000 | 0.77% | 0.0471 |
| `title-splash` | `SplashTitle` | 1.30% | 1.000 | 0.28% | 0.0483 |
