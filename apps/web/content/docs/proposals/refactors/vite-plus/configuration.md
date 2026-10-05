---
title: Configuration
description: The one root config `vp` needs, why lint and format keep their own files rather than moving into it, and the seam where Nuxt keeps its config — quieter in this layout than upstream discussion suggests.
model: claude-opus-5-5
---

# Configuration

Vite+ reads its settings from a root `vite.config.ts`, and reads a monorepo's existence from that file too — a root config is how `vp` knows it is in a workspace at all ([monorepo guide](https://viteplus.dev/guide/monorepo)). The guides then invite moving every tool's settings into blocks of that file: `lint`, `fmt`, `test`, `pack` and `run`. Under this proposal's decision only one of those blocks is taken.

## The root config holds tasks and nothing else

The root `vite.config.ts` carries the `run` block: the cache switches, the fingerprinted environment, and any task that needs more than a manifest script gives it. Package scripts are not cached by default — only tasks declared in the config are — so the block turns script caching on rather than redeclaring every script as a task ([run config](https://viteplus.dev/config/run)). At 1.0 a task's cache settings — `env`, `untrackedEnv`, `input` and `output` — live under its `cache` key, and `input` defaults to automatic tracking, which is the only setting this proposal wants.

That makes the file small, and small is the reason it stays one file. The repository decomposes a config into one module per concern when the concerns are separately editable and separately reviewable — `apps/web/configuration/` for Nuxt, the shared factories in `packages/configuration/src/` for every package — and a single block of cache switches is one concern. A `configuration/` directory beside it would be the structure without the reason.

```mermaid
flowchart TD
  root["vite.config.ts — the run block only"] --> vp["vp run --cache"]
  oxlintConfig["oxlint.config.ts — rules, overrides, local plugins"] --> oxlint["the catalog's oxlint, invoked by a script"]
  oxfmtConfig["oxfmt.config.ts"] --> oxfmt["the catalog's oxfmt, invoked by a script"]
  nuxtRoot["apps/web/nuxt.config.ts and its configuration modules"] --> nuxtBuild["nuxt build — its own module graph"]
  vp -->|"runs as a task"| oxlint
  vp -->|"runs as a task"| oxfmt
  vp -->|"runs as a task"| nuxtBuild
  root -.->|"configures none of them"| nuxtBuild
```

The dotted edge is the point of the diagram. `vp` reaches every tool only as a task, so no tool's behaviour is configured by the file `vp` reads.

## Why lint and format keep their own files

The lint guide is explicit that standalone `oxlint.config.ts` files are not the recommended shape with Vite+ ([lint guide](https://viteplus.dev/guide/lint)). That advice is about `vp lint`, and it does not apply here, because `vp lint` is not used.

The reason is version ownership. The `vite-plus` package depends on exact versions of Oxlint, Oxfmt, the Oxlint plugin API and Vitest, and ships its own build of Vite as a separate package. At 1.0 each of the four trails the version this repository's catalog already runs, and stays behind until the next Vite+ release moves its pin — Renovate can bump the catalog, but not what `vp lint` executes. Running the built-in commands would therefore mean:

- **A second copy of every tool in the lockfile**, and a lint run whose rule set depends on which copy a command reaches.
- **Every tool bump waiting on a Vite+ release**, so the repository's dependency process stops owning the tools it gates on.
- **The local rule plugins split across two plugin APIs.** They import their authoring API from the catalog's `@oxlint/plugins`; the bundled linter brings an older copy of it, and the guide points plugin authors at its own re-export instead.

Nothing is bought in return. The `lint` block would hold exactly what `oxlint.config.ts` holds — that file already has the single-config, per-glob-`overrides` shape the monorepo guide describes — so the relocation changes who reads the settings and nothing they do. The item is parked in [phases](/docs/proposals/refactors/vite-plus/phases) with its trigger: the built-in commands running the project's installed tools.

ESLint is untouched either way. Oxlint parses a `.vue` file's script block and not its template, and templates are where a large share of this repo's rules apply; which rules cross over is governed by the [ESLint to oxlint migration](/docs/architecture/lint-toolchain), and Vite+ changes neither what the linter can parse nor who owns that migration.

## The Nuxt seam

Nuxt wraps Vite and discourages a standalone `vite.config.ts`; Vite+ requires one. Asking `nuxt.config.ts` to stand in for it was closed upstream without an implementation ([issue 912](https://github.com/voidzero-dev/vite-plus/issues/912)), and a broader request for a Nuxt and Astro integration — a module exposing Vite+ config from the framework's own config, and `vp dev`/`vp build` calling the framework's commands — is open, with a Nuxt maintainer exploring a generated `vite.config.ts` from the Nuxt side ([issue 1506](https://github.com/voidzero-dev/vite-plus/issues/1506)). So far it has produced only a hint pointing `vp dev` users at the package script.

The warning that discussion is about does not reach this layout. Nuxt's external-config check looks for a `vite.config` file by resolving from the app's own root directory, and the config `vp` needs sits at the workspace root, above it; the app's directory gets no `vite.config.ts` of its own, because the app's scripts are cached as manifest scripts rather than declared as tasks there. The two config trees still exist — one for `vp`, one for Nuxt — but they do not overlap, and nothing is warned about.

That arrangement is static: it needs no per-change attention, and it collapses on its own if the integration request ships. The root file should still say in a comment that it configures no bundler, because anyone opening it expecting to find how the app is built will not find it there.

## Node runtime and package manager

`vp env` manages Node and the package manager together, so it subsumes the provisioning half of `update:node` and nothing else — the pins it writes and why they cannot move are in [commands](/docs/proposals/refactors/vite-plus/commands). The catalog does not move: versions live in the workspace catalog and `vp` drives pnpm rather than replacing it, so the [dependency update process](/docs/architecture/monorepo-tooling) survives unedited — which is the same property the lint decision above protects.

## Key files

| File                                  | Role after the change                                                        |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| `oxlint.config.ts`                    | unchanged — the catalog's Oxlint keeps reading it, run as a task             |
| `oxfmt.config.ts`                     | unchanged, for the same reason                                               |
| `apps/web/nuxt.config.ts`             | the Nuxt seam, which keeps owning the app build                              |
| `packages/configuration/src/index.ts` | the shared config factories, untouched — `vp` configures none of these tools |

## Sources

- [Vite+ — monorepo guide](https://viteplus.dev/guide/monorepo), [lint guide](https://viteplus.dev/guide/lint) and [run config](https://viteplus.dev/config/run) — the root config, the advice against standalone lint files, and the 1.0 cache settings.
- [Vite+ issue 912](https://github.com/voidzero-dev/vite-plus/issues/912), [issue 1506](https://github.com/voidzero-dev/vite-plus/issues/1506) and the [Nuxt discussion](https://github.com/nuxt/nuxt/discussions/34857) — what Vite+ cannot yet own for a Nuxt app, and the integration still open.
