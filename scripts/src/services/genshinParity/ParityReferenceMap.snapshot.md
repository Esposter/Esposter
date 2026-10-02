# Parity scores

Every reference's last `pnpm -C scripts genshin:parity compare`, which rewrites its own row (`--all` rewrites them
all). The mean difference, the tone and FLIP's perceptual error run from 0 (identical) up; the shape is the share of
the reference's edges the shot shares, 1 identical. Commit it with the change that moved it, as a bench's report is
committed.

| Reference | Screen | Mean difference | Shape | Tone | FLIP |
| :-------- | :----- | --------------: | ----: | ---: | ---: |
| `health-notice` | `SplashHealthNotice` | 6.00% | 0.961 | 0.83% | 0.1853 |
| `loading-startup` | `LoadingStartup` | 0.03% | 0.989 | 0.00% | 0.0013 |
| `login-dawn-title` | `LoginScreen` | 13.76% | 0.362 | 10.03% | 0.5159 |
| `login-day-title` | `LoginScreen` | 13.19% | 0.403 | 9.92% | 0.4882 |
| `login-door` | `LoginScreen` | 9.76% | 0.297 | 8.85% | 0.4526 |
| `login-door-recording` | `LoginScreen` | 18.15% | 0.462 | 14.14% | 0.5850 |
| `login-interface-door` | `LoginInterface` | 0.63% | 0.986 | 0.43% | 0.0252 |
| `login-interface-loading` | `LoginInterface` | 0.16% | 0.995 | 0.09% | 0.0061 |
| `login-interface-mainland-rating` | `LoginInterface` | 2.11% | 0.959 | 1.12% | 0.1095 |
| `login-interface-title` | `LoginInterface` | 0.35% | 0.997 | 0.23% | 0.0155 |
| `login-night-title` | `LoginScreen` | 11.91% | 0.432 | 9.25% | 0.4544 |
| `publisher-splash` | `SplashPublisher` | 0.07% | 1.000 | 0.01% | 0.0036 |
| `title-splash` | `SplashTitle` | 0.21% | 1.000 | 0.01% | 0.0090 |
| `title-splash-mainland` | `SplashTitle` | 1.80% | 0.992 | 0.81% | 0.0787 |
