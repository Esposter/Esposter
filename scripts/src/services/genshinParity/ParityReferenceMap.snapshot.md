# Parity scores

Every reference's last `pnpm -C scripts genshin:parity compare`, which rewrites its own row (`--all` rewrites them
all). The mean difference, the tone and FLIP's perceptual error run from 0 (identical) up; the shape is the share of
the reference's edges the shot shares, 1 identical. Commit it with the change that moved it, as a bench's report is
committed.

| Reference | Screen | Mean difference | Shape | Tone | FLIP |
| :-------- | :----- | --------------: | ----: | ---: | ---: |
| `health-notice` | `SplashHealthNotice` | 6.50% | 0.972 | 1.15% | 0.2067 |
| `loading-startup` | `LoadingStartup` | 0.03% | 0.989 | 0.00% | 0.0013 |
| `login-dawn` | `LoginScreen` | 20.96% | 0.270 | 17.03% | 0.6473 |
| `login-day` | `LoginScreen` | 18.15% | 0.362 | 13.60% | 0.5856 |
| `login-door` | `LoginScreen` | 19.10% | 0.282 | 17.92% | 0.6183 |
| `login-door-recording` | `LoginScreen` | 19.17% | 0.355 | 14.30% | 0.6341 |
| `login-dusk` | `LoginScreen` | 22.24% | 0.298 | 17.71% | 0.6733 |
| `login-interface-door` | `LoginInterface` | 0.63% | 0.986 | 0.43% | 0.0252 |
| `login-interface-loading` | `LoginInterface` | 0.16% | 0.995 | 0.09% | 0.0061 |
| `login-interface-title` | `LoginInterface` | 0.35% | 0.997 | 0.23% | 0.0155 |
| `login-night` | `LoginScreen` | 15.16% | 0.275 | 12.03% | 0.5334 |
| `publisher-splash` | `SplashPublisher` | 0.46% | 1.000 | 0.77% | 0.0471 |
| `title-splash` | `SplashTitle` | 1.30% | 1.000 | 0.28% | 0.0483 |
