# Parity scores

Every reference's last `pnpm -C scripts genshin:parity compare`, which rewrites its own row (`--all` rewrites them
all). The mean difference, the tone and FLIP's perceptual error run from 0 (identical) up; the shape is the share of
the reference's edges the shot shares, 1 identical. Commit it with the change that moved it, as a bench's report is
committed.

| Reference | Screen | Mean difference | Shape | Tone | FLIP |
| :-------- | :----- | --------------: | ----: | ---: | ---: |
| `health-notice` | `SplashHealthNotice` | 6.00% | 0.961 | 0.83% | 0.1853 |
| `loading-startup` | `LoadingStartup` | 0.03% | 0.989 | 0.00% | 0.0013 |
| `login-dawn-title` | `LoginScreen` | 9.46% | 0.480 | 6.71% | 0.3805 |
| `login-day-title` | `LoginScreen` | 11.40% | 0.402 | 8.64% | 0.4321 |
| `login-door` | `LoginScreen` | 11.38% | 0.298 | 9.71% | 0.4667 |
| `login-door-recording` | `LoginScreen` | 13.82% | 0.420 | 9.32% | 0.5126 |
| `login-interface-door` | `LoginInterface` | 0.63% | 0.986 | 0.43% | 0.0252 |
| `login-interface-loading` | `LoginInterface` | 0.16% | 0.995 | 0.09% | 0.0061 |
| `login-interface-mainland-rating` | `LoginInterface` | 2.11% | 0.959 | 1.12% | 0.1095 |
| `login-interface-title` | `LoginInterface` | 0.34% | 0.997 | 0.24% | 0.0154 |
| `login-night-title` | `LoginScreen` | 8.97% | 0.381 | 6.39% | 0.3654 |
| `publisher-splash` | `SplashPublisher` | 0.07% | 1.000 | 0.01% | 0.0036 |
| `title-splash` | `SplashTitle` | 0.21% | 1.000 | 0.01% | 0.0090 |
| `title-splash-mainland` | `SplashTitle` | 1.80% | 0.992 | 0.81% | 0.0787 |
