---
name: package-scripts
description: Esposter pnpm script reference for packages/app — lint, typecheck, test, format, dev, and build commands. Apply whenever running or recommending package scripts.
---

# Package Scripts (`packages/app`)

All commands must be run from `packages/app/` using `pnpm`. Never use `npm` or `npx`.

| Command             | Runs                                                             | When to use                                               |
| ------------------- | ---------------------------------------------------------------- | --------------------------------------------------------- |
| `pnpm lint`         | `oxlint && eslint --config eslint.light.config.js .`             | Check for lint errors                                     |
| `pnpm lint:fix`     | `oxlint --fix && eslint --config eslint.light.config.js --fix .` | **Fix lint errors** — always use this, never fix manually |
| `pnpm lint:all`     | full ESLint (no `light` config)                                  | Full lint pass (slower)                                   |
| `pnpm lint:all:fix` | full ESLint fix                                                  | Fix all lint errors (full pass)                           |
| `pnpm typecheck`    | `nuxt typecheck`                                                 | TypeScript type checking                                  |
| `pnpm test`         | `vitest` (watch mode)                                            | Run tests in watch mode                                   |
| `pnpm coverage`     | `vitest run --coverage`                                          | Run tests with coverage report                            |
| `pnpm format`       | `oxfmt`                                                          | Format code                                               |
| `pnpm format:check` | `oxfmt --check`                                                  | Check formatting without writing                          |
| `pnpm dev`          | `nuxt dev`                                                       | Start dev server                                          |
| `pnpm build`        | `nuxt build`                                                     | Build for production                                      |

## Package Registry Commands

| Command                 | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `pnpm info <pkg>`       | Show package metadata (version, description, deps) |
| `pnpm show <pkg>`       | Alias for `pnpm info`                              |
| `pnpm search <keyword>` | Search npm registry for packages                   |
| `pnpm outdated`         | List outdated dependencies                         |
| `pnpm list`             | List installed packages                            |

## Key Rules

- **Lint errors**: always run `pnpm lint:fix` — never manually edit to satisfy ESLint/oxlint
- **Long-running commands** (`dev`, `build`, `test`, `typecheck`): run with `run_in_background: true` on the Bash tool — they can take 2+ minutes
