# OpenSpec

The legacy proposals moving into `openspec/changes/`, one proposals area per unit. The rules for a migrated spec are the `openspec` skill; the migration changes no behaviour and deletes the proposal it moves.

| Unit           | Swept | Notes |
| -------------- | ----- | ----- |
| `architecture` | —     |       |
| `esbabbler`    | —     |       |
| `genshin`      | —     |       |
| `infra`        | —     |       |
| `post`         | —     |       |
| `resource`     | —     |       |
| `shared`       | —     |       |

## Open follow-ups

Not started. Each one waits on the decision or the migration named beside it.

| Item                                                                                                                                                                                                                          | Waits on                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `ai:proposals:report` sizes OpenSpec changes as well as proposals                                                                                                                                                             | the first area moved into `openspec/changes/`               |
| `openspec validate --changes --strict` runs in CI; today only the scenario test runs, through `pnpm test`                                                                                                                     | nothing                                                     |
| Decide whether the in-app `/docs` (`apps/web/app/composables/docs/`) stays. It is product code, so the docs toolchain (`@nuxt/content`, `mermaid`, `index.test.ts`) follows that decision                                     | owner decision                                              |
| Remove TypeDoc: the root `build:docs` script, `typedoc` in `package.json`, `apps/functions` and `packages/azure-mock`, the commented `build-docs` job in `.github/workflows/CI.yaml`, and the TODO on the root `build` script | the TypeDoc TypeScript 7 issue, or the owner decision above |
| Decide the CLI pin: `^1.12.0` in `pnpm-workspace.yaml` against the exact `1.12.0` the team kit's `/opsx-setup` checks                                                                                                         | owner decision                                              |
| Retire `.agents/ledgers/docs/` if the docs site retires                                                                                                                                                                       | the docs decision above                                     |
