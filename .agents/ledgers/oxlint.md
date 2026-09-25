# Oxlint

The lint configuration, the custom plugins, and every disable directive — spelled the reporting linter's way, scoped to its line, and carrying its reason.

| Unit                                                                     | Swept | Notes |
| ------------------------------------------------------------------------ | ----- | ----- |
| `.oxlintrc.json`                                                         | —     |       |
| `packages/configuration/eslint`                                          | —     |       |
| `scripts/src/oxlint`, `scripts/src/services/oxlint` — the custom plugins | —     |       |
| disable directives — `apps/web/app`                                      | —     |       |
| disable directives — `apps/web/server`, `shared`, `configuration`        | —     |       |
| disable directives — `packages`                                          | —     |       |
| disable directives — `scripts`, `apps/functions`, `apps/infra`           | —     |       |

## Find recipe

```bash
git grep -n -E '(eslint|oxlint)-disable' -- apps packages scripts
```
