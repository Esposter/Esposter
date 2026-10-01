# Parity scores

Every reference's last `pnpm -C scripts genshin:parity compare`, which rewrites its own row (`--all` rewrites them
all). The mean difference, the tone and FLIP's perceptual error run from 0 (identical) up; the shape is the share of
the reference's edges the shot shares, 1 identical. Commit it with the change that moved it, as a bench's report is
committed.

| Reference | Screen | Mean difference | Shape | Tone | FLIP |
| :-------- | :----- | --------------: | ----: | ---: | ---: |
| `health-notice` | `SplashHealthNotice` | 6.50% | 0.972 | 1.15% | 0.2067 |
| `loading-startup` | `LoadingStartup` | 0.03% | 0.989 | 0.00% | 0.0013 |
| `login-dawn` | `LoginScreen` | 22.35% | 0.301 | 18.93% | 0.6516 |
| `login-day` | `LoginScreen` | 20.51% | 0.417 | 16.43% | 0.6193 |
| `login-door` | `LoginScreen` | 17.17% | 0.360 | 15.64% | 0.5831 |
| `login-door-recording` | `LoginScreen` | 21.61% | 0.315 | 17.31% | 0.6626 |
| `login-dusk` | `LoginScreen` | 24.30% | 0.325 | 20.44% | 0.6742 |
| `login-interface-door` | `LoginInterface` | 0.63% | 0.986 | 0.43% | 0.0252 |
| `login-interface-loading` | `LoginInterface` | 0.16% | 0.995 | 0.09% | 0.0061 |
| `login-interface-title` | `LoginInterface` | 0.35% | 0.997 | 0.23% | 0.0155 |
| `login-night` | `LoginScreen` | 15.93% | 0.256 | 13.11% | 0.5265 |
| `publisher-splash` | `SplashPublisher` | 0.46% | 1.000 | 0.77% | 0.0471 |
| `title-splash` | `SplashTitle` | 1.30% | 1.000 | 0.28% | 0.0483 |
