# Tracked Issues

Read when bumping `oxlint`, `oxlint-tsgolint`, `vitest` or `@vitest/coverage-v8` — each updates normally but has something to watch.

- **`oxlint`** — has `^`; open issue https://github.com/oxc-project/oxc/issues/13204.
- **`oxlint-tsgolint`** — a bump here is the one thing that could retire the `ignorePatterns` entry covering tsgo's infinite loop on the recursive `three/tsl` types. It ships its own Go binaries, so the `typescript` alias does not move it. Check it on every bump; the exclusion itself, and the CI symptom that does not look like a hang, are documented in the `oxlint` skill's `references/lint-configuration.md`.
- **`vitest`, `@vitest/coverage-v8`** — Renovate's vitest monorepo group moves them as the pair they are (`@vitest/coverage-v8` peers vitest at the exact version). A major also waits on `@nuxt/test-utils` peering the new line — it widens its `vitest` peer one major at a time, and the next major needs the same; no rule encodes that, because the peer conflict fails the install in the branch and a major is never automerged.
