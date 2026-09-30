# Parity scores

Every reference's last `pnpm -C scripts genshin:parity compare`, which rewrites its own row (`--all` rewrites them
all). The mean difference and the tone run from 0 (identical) up; the shape is the share of the reference's edges
the shot shares, 1 identical. Commit it with the change that moved it, as a bench's report is committed.

| Reference | Screen | Mean difference | Shape | Tone |
| :-------- | :----- | --------------: | ----: | ---: |
| `health-notice` | `SplashHealthNotice` | 6.50% | 0.972 | 1.15% |
| `loading-startup` | `LoadingStartup` | 0.03% | 1.000 | 0.00% |
| `login-dawn` | `LoginScreen` | 25.53% | 0.317 | 21.74% |
| `login-day` | `LoginScreen` | 20.85% | 0.318 | 17.85% |
| `login-door` | `LoginScreen` | 25.95% | 0.183 | 25.07% |
| `login-dusk` | `LoginScreen` | 26.07% | 0.302 | 22.17% |
| `login-interface-door` | `LoginInterface` | 0.57% | 0.987 | 0.43% |
| `login-interface-loading` | `LoginInterface` | 0.07% | 0.995 | 0.03% |
| `login-interface-title` | `LoginInterface` | 0.23% | 0.999 | 0.17% |
| `login-night` | `LoginScreen` | 17.45% | 0.278 | 13.95% |
| `publisher-splash` | `SplashPublisher` | 0.46% | 1.000 | 0.77% |
| `title-splash` | `SplashTitle` | 1.29% | 1.000 | 0.26% |
