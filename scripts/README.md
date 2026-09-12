# @esposter/scripts

[![Apache-2.0 licensed][badge-license]][url-license]

The repository's own tooling — the workspace dependency graph, the outdated-dependency report, the custom oxlint plugins, the sweep scans, the CodeRabbit review tooling and the cross-platform launcher. It is the workspace's machinery rather than part of the product, which is why it sits at the repository root beside `.github/` and `.agents/` instead of under `apps/` or `packages/`.

## Table of Contents

- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs) to level up.

### What's Included

| Directory               | What it does                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `dependencyGraph/`      | Renders `dependency-graph.svg` from the workspace manifests, roles read off the edges rather than off a list       |
| `outdatedDependencies/` | Checks every manifest against the catalog, the lockfile and the registry, and prints the mismatches                |
| `oxlint/`               | The custom oxlint JS plugins `.oxlintrc.json` loads by path                                                        |
| `coderabbit/`           | The review-feedback, probe, window and exclusion readers behind each `ai:coderabbit:*` script (`coderabbit` skill) |
| `sweeps/`               | The find recipes behind each `ai:sweep:*` script, one per ledger scan (`sweeps` skill)                             |
| `updateNode/`           | Bumps the node pins and hands installation to fnm through the platform script                                      |
| `workspace/`            | The workspace invariants — declaration generation, side effects, symlink escapes, private dependency edges         |
| `services/`, `models/`  | Every command's functions and types, one subfolder per command, with what more than one shares at the root         |
| `crossOS.ts`            | Runs the per-platform command the root manifest's `crossOS` map names for a script                                 |

### Architecture Notes

- **An entrypoint folder holds the entrypoint alone.** `src/<command>/index.ts` is what the manifest names, and what it runs is under `services/<command>/` with its types under `models/<command>/` (`file-organization` skill).
- **Nothing imports it.** It is run, never resolved, so it publishes no `exports`, builds no `dist`, and addresses its own sources through the `#src/*` subpath its manifest declares.
- **Every `.ts` entrypoint runs under `tsx`**, which is what makes an enum available to a script (`package-scripts` skill).
- **The root delegates to it by filter**, so the root manifest names a script rather than a path into this tree.
- **The oxlint plugins are loaded by path** from `.oxlintrc.json` — a config read before anything is resolved, so moving one is a lint failure by name rather than a silent miss.

### Commands

Run from `scripts/`:

```bash
pnpm test         # vitest watch mode (coverage is run from the repo root)
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
