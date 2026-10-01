# Parity scores

Every reference's last `pnpm -C scripts genshin:parity compare`, which rewrites its own row (`--all` rewrites them
all). The mean difference, the tone and FLIP's perceptual error run from 0 (identical) up; the shape is the share of
the reference's edges the shot shares, 1 identical. Commit it with the change that moved it, as a bench's report is
committed.

| Reference | Screen | Mean difference | Shape | Tone | FLIP |
| :-------- | :----- | --------------: | ----: | ---: | ---: |
| `health-notice` | `SplashHealthNotice` | 6.50% | 0.972 | 1.15% | 0.2067 |
| `loading-startup` | `LoadingStartup` | 0.03% | 0.989 | 0.00% | 0.0013 |
| `login-dawn` | `LoginScreen` | 20.58% | 0.322 | 16.55% | 0.6450 |
| `login-day` | `LoginScreen` | 18.39% | 0.392 | 14.36% | 0.5908 |
| `login-door` | `LoginScreen` | 19.21% | 0.277 | 18.11% | 0.6159 |
| `login-door-recording` | `LoginScreen` | 19.09% | 0.343 | 14.29% | 0.6328 |
| `login-dusk` | `LoginScreen` | 21.98% | 0.310 | 17.24% | 0.6718 |
| `login-interface-door` | `LoginInterface` | 0.63% | 0.986 | 0.43% | 0.0252 |
| `login-interface-loading` | `LoginInterface` | 0.16% | 0.995 | 0.09% | 0.0061 |
| `login-interface-title` | `LoginInterface` | 0.35% | 0.997 | 0.23% | 0.0155 |
| `login-night` | `LoginScreen` | 14.39% | 0.294 | 11.84% | 0.5207 |
| `publisher-splash` | `SplashPublisher` | 0.46% | 1.000 | 0.77% | 0.0471 |
| `title-splash` | `SplashTitle` | 1.30% | 1.000 | 0.28% | 0.0483 |
