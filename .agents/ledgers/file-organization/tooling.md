# Tooling

`scripts/`, `.agents/`, the app's root configuration and `content/`.

| Unit                                                                                                                  | Swept      | Notes                                                                                         |
| --------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------- |
| `scripts/src/<command>` — the entrypoints                                                                             | 2026-09-22 | a command keeps its entrypoint; its functions live in `services/<command>`, types in `models` |
| `scripts/src/oxlint`                                                                                                  | 2026-09-22 | `.oxlintrc.json` loads a plugin by path, so the entrypoint stays; the rules move out          |
| `scripts/src/services/oxlint`, `models/oxlint`                                                                        | 2026-09-22 |                                                                                               |
| `scripts/src/services/coderabbit`, `models/coderabbit`                                                                | 2026-09-22 | two verbs; what both share sits in `services/coderabbit/shared`                               |
| `scripts/src/services/outdatedDependencies`, `models/outdatedDependencies`                                            | 2026-09-22 |                                                                                               |
| `scripts/src/sweeps`, `services/sweeps`, `models/sweeps`                                                              | 2026-09-22 | one entrypoint per scan                                                                       |
| `scripts/src/services` — `citations`, `dependencyGraph`, `jev`, `triage`, `updateNode`, `voiceMatch` + their `models` | 2026-09-22 |                                                                                               |
| `scripts/src/services/shared`, `models/shared`, `workspace`, root                                                     | 2026-09-22 | a repo invariant suite is a `workspace/` suite; cross-command files are in `shared`           |
