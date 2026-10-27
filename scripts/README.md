# @esposter/scripts

[![Apache-2.0 licensed][badge-license]][url-license]

The repository's own tooling — the workspace dependency graph, the outdated-dependency report, the custom oxlint plugins, the sweep scans and the cross-platform launcher.

## Table of Contents

- 📖 [Documentation](#documentation)
- ⌨️ [Commands](#commands)
- 🔗 [Related Documentation](#related)
- ⚖️ [License](#license)

---

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/tree/main/openspec/specs) to level up.

It is the workspace's machinery rather than part of the product, which is why it sits at the repository root beside `.github/` and `.agents/` instead of under `apps/` or `packages/`.

### What's Included

| Directory               | What it does                                                                                                                                                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `crossOS/`              | Runs the per-platform command the root manifest's `crossOS` map names for a script                                                                                                                                                             |
| `dependencyGraph/`      | Renders `dependency-graph.svg` from pnpm's resolved workspace edges, roles read off the edges rather than off a list                                                                                                                           |
| `models/`, `services/`  | Every command's functions and types, one subfolder per command, with what more than one shares in `shared/`                                                                                                                                    |
| `outdatedDependencies/` | Checks every manifest, image, action and runner against the catalog, the lockfile and its source, and prints the mismatches                                                                                                                    |
| `oxlint/`               | The custom oxlint JS plugins `oxlint.config.ts` loads by path                                                                                                                                                                                  |
| `sweeps/`               | The find recipes behind each `ai:sweep:*` script, one per ledger scan (`sweeps` skill)                                                                                                                                                         |
| `updateNode/`           | Bumps the node pin and hands installation to `vp env`                                                                                                                                                                                          |
| `voiceMatch/`           | The reference selection — every character's story lines measured off the wiki, the most typical line chosen and its clone scored, generated into the plugin as one map (`openspec/specs/infra/claude-interface/reference-selection/design.md`) |
| `workspace/`            | The workspace invariants — declaration generation, side effects, symlink escapes, private dependency edges                                                                                                                                     |

### Architecture Notes

- **An entrypoint folder holds the entrypoint, and the platform scripts it dispatches to.** `src/<command>/index.ts` is what the manifest names, and what it runs is under `services/<command>/` with its types under `models/<command>/` (`file-organization` skill).
- **An entrypoint runs under `node` where stripping can run it and under `vpx` where it cannot**, and the manifest names the runner each one gets. A script with an enum needs `vpx`, which is what makes that enum available (`package-scripts` skill).
- **Nothing imports it.** It is run, never resolved, so it publishes no `exports`, builds no `dist`, and addresses its own sources through the `#src/*` subpath its manifest declares.
- **The oxlint plugins are loaded by path** from `oxlint.config.ts` — a config read before anything is resolved, so moving one is a lint failure by name rather than a silent miss.
- **The root delegates to it by directory**, with `pnpm -C scripts <name>`, so the root manifest names a script rather than a path into this tree.

## <a name="commands">⌨️ Commands</a>

Run from `scripts/`:

```bash
pnpm ai:ci:watch
pnpm ai:citations:sync
pnpm ai:dependencies:score
pnpm ai:fleet:claim
pnpm ai:fleet:data
pnpm ai:fleet:hold
pnpm ai:fleet:next
pnpm ai:fleet:profile
pnpm ai:fleet:release
pnpm ai:fleet:status
pnpm ai:gcsim:configs
pnpm ai:identifiers:rename
pnpm ai:machine:watch
pnpm ai:package:new
pnpm ai:proposals:report
pnpm ai:resume
pnpm ai:review
pnpm ai:review:fix
pnpm ai:review:settle
pnpm ai:skills:extract
pnpm ai:sweep:constant-scope
pnpm ai:sweep:duplicate-code
pnpm ai:sweep:duplicate-prose
pnpm ai:sweep:file-organization
pnpm ai:sweep:ledger-coverage
pnpm ai:sweep:repeated-list-items
pnpm ai:sweep:shared-export-consumers
pnpm ai:sweep:skill-docs
pnpm ai:sweep:unterminated-results
pnpm ai:triage:label
pnpm ai:usage
pnpm ai:voice-match
pnpm ai:worktree:remove
pnpm bench
pnpm bench:types
pnpm crossOS
pnpm genshin:animestudio:build
pnpm genshin:assets
pnpm genshin:data
pnpm genshin:parity
pnpm genshin:text
pnpm graph:gen
pnpm lint
pnpm lint:fix
pnpm outdated:dependencies
pnpm recreation
pnpm test        # vitest watch mode (coverage is run from the repo root)
pnpm typecheck
pnpm update:node
```

## <a name="related">🔗 Related Documentation</a>

- [Vite+](https://viteplus.dev/guide/)
- [Vitest](https://vitest.dev/guide/)
- [Zod](https://zod.dev/)

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
