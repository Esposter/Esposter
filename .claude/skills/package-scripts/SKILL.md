---
name: package-scripts
description: Esposter pnpm script reference for packages/app — lint, typecheck, test, format, dev, and build commands. Apply whenever running or recommending package scripts.
---

# Package Scripts (`packages/app`)

All commands must be run from `packages/app/` using `pnpm`. Never use `npm` or `npx`.

| Command             | Runs                                                             | When to use                                     |
| ------------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| `pnpm lint`         | `oxlint && eslint --config eslint.light.config.js .`             | CI/check-only lint verification                 |
| `pnpm lint:fix`     | `oxlint --fix && eslint --config eslint.light.config.js --fix .` | **Local lint verification** — use this directly |
| `pnpm lint:all`     | full ESLint (no `light` config)                                  | Full lint pass (slower)                         |
| `pnpm lint:all:fix` | full ESLint fix                                                  | Fix all lint errors (full pass)                 |
| `pnpm typecheck`    | `nuxt typecheck`                                                 | TypeScript type checking                        |
| `pnpm test`         | `vitest` (watch mode)                                            | Run tests in watch mode                         |
| `pnpm coverage`     | `vitest run --coverage`                                          | Run tests with coverage report                  |
| `pnpm format`       | `oxfmt`                                                          | Format code                                     |
| `pnpm format:check` | `oxfmt --check`                                                  | Check formatting without writing                |
| `pnpm dev`          | `nuxt dev`                                                       | Start dev server                                |
| `pnpm build`        | `nuxt build`                                                     | Build for production                            |

## Package Registry Commands

| Command                 | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `pnpm info <pkg>`       | Show package metadata (version, description, deps) |
| `pnpm show <pkg>`       | Alias for `pnpm info`                              |
| `pnpm search <keyword>` | Search npm registry for packages                   |
| `pnpm outdated`         | List outdated dependencies                         |
| `pnpm list`             | List installed packages                            |

## Root Scripts

| Command                | Notes                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| `pnpm i`               | Refresh dependencies/lockfile after manifest changes; use this exact command.                   |
| `pnpm catalog:check`   | Verify catalog specifiers in `pnpm-workspace.yaml` match resolved versions in the lockfile.     |
| `pnpm depcruise:graph` | Generate `dependency-graph.svg` directly from dependency-cruiser DOT output via `graphviz-cli`. |

Use plain `pnpm i` exactly. Follow `architecture/monorepo-tooling.md` for install safety rules.

## Key Rules

- **Local linting**: run `pnpm lint:fix` directly — never manually edit to satisfy ESLint/oxlint
- **Check-only linting**: reserve `pnpm lint` and `pnpm lint:all` for CI/CD-style verification or when explicitly requested.
- **Do not run tests on Windows**: Vitest currently fails during config startup on Windows (`spawn EPERM`). Do not run `pnpm test`, targeted Vitest files, or coverage unless the user explicitly asks and acknowledges the Windows limitation.
- **Long-running commands** (`dev`, `build`, `test`, `typecheck`): run with `run_in_background: true` on the Bash tool — they can take 2+ minutes
