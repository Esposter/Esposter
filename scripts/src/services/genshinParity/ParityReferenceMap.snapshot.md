# Parity scores

Every reference's last `pnpm -C scripts genshin:parity compare`, which rewrites its own row (`--all` rewrites them
all). The mean difference and the tone run from 0 (identical) up; the shape is the share of the reference's edges
the shot shares, 1 identical. Commit it with the change that moved it, as a bench's report is committed.

| Reference | Screen | Mean difference | Shape | Tone |
| :-------- | :----- | --------------: | ----: | ---: |
| `health-notice` | `SplashHealthNotice` | 6.50% | 0.972 | 1.15% |
| `loading-startup` | `LoadingStartup` | 0.03% | 1.000 | 0.00% |
| `login-dawn` | `LoginScreen` | 27.99% | 0.301 | 24.32% |
| `login-day` | `LoginScreen` | 21.76% | 0.320 | 18.79% |
| `login-door` | `LoginScreen` | 27.36% | 0.233 | 26.38% |
| `login-dusk` | `LoginScreen` | 28.36% | 0.278 | 24.42% |
| `login-interface-door` | `LoginInterface` | 0.64% | 0.986 | 0.43% |
| `login-interface-loading` | `LoginInterface` | 0.17% | 0.995 | 0.09% |
| `login-interface-title` | `LoginInterface` | 0.36% | 0.997 | 0.23% |
| `login-night` | `LoginScreen` | 17.52% | 0.296 | 14.52% |
| `publisher-splash` | `SplashPublisher` | 0.46% | 1.000 | 0.77% |
| `title-splash` | `SplashTitle` | 1.29% | 1.000 | 0.26% |
