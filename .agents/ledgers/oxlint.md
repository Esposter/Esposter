# Oxlint

The lint configuration, the custom plugins, and every disable directive — spelled the reporting linter's way, scoped to its line, and carrying its reason.

| Unit                                                                     | Swept                 | Notes |
| ------------------------------------------------------------------------ | --------------------- | ----- |
| `oxlint.config.ts`                                                       | 2026-09-25 · Opus 5.5 |       |
| `packages/configuration/eslint`                                          | 2026-09-25 · Opus 5.5 |       |
| `scripts/src/oxlint`, `scripts/src/services/oxlint` — the custom plugins | 2026-09-25 · Opus 5.5 |       |
| disable directives — `apps/web/app`                                      | 2026-09-25 · Opus 5.5 |       |
| disable directives — `apps/web/server`, `shared`, `configuration`        | 2026-09-25 · Opus 5.5 |       |
| disable directives — `packages`                                          | 2026-09-25 · Opus 5.5 |       |
| disable directives — `scripts`, `apps/functions`, `apps/infra`           | 2026-09-25 · Opus 5.5 |       |

## Find recipe

```bash
git grep -n -E '(eslint|oxlint)-disable' -- apps packages scripts
```
