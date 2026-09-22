# Tooling

`scripts/`, `.agents/`, the app's root configuration and `content/`.

| Unit                                                               | Swept      | Notes                                                                                         |
| ------------------------------------------------------------------ | ---------- | --------------------------------------------------------------------------------------------- |
| `scripts/src/dependencyGraph`                                      | 2026-09-12 | a command keeps its entrypoint; its functions live in `services/<command>`, types in `models` |
| `scripts/src/oxlint`                                               | 2026-09-12 | `.oxlintrc.json` loads a plugin by path, so the entrypoint stays; the rules move out          |
| `scripts/src/coderabbit`                                           | 2026-09-13 | two verbs; what both share sits in `services/coderabbit/shared`                               |
| `scripts/src/outdatedDependencies` — `models`, `lock`, `workspace` | 2026-09-12 | the readers of the two yaml files                                                             |
| `scripts/src/outdatedDependencies` — the rest                      | 2026-09-12 | `manifest`, `registry`, `pnpm`, `print`, and what two of them share at the root               |
| `scripts/src/updateNode`                                           | 2026-09-12 |                                                                                               |
| `scripts/src/sweeps` — `constantScope`, `repeatedListItems`        | 2026-09-22 | one entrypoint per scan                                                                       |
| `scripts/src/sweeps` — the rest                                    | 2026-09-22 | `skillDocs`, `sharedExportConsumers`, `unterminatedResults`, the root helpers                 |
| `scripts/src` — `services`, `models`, `workspace`, root            | 2026-09-13 | a repo invariant suite is a `workspace/` suite; cross-command files are in `shared`           |
