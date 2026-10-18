# Creating a new workspace package

Read when a workspace package is being created, or when a package's scaffold or its inventory rows are wrong. A package is created by `pnpm ai:package:new <name> [--kind library|nuxt-module|plugin] [--description "..."] [--register]`.
It writes the manifest, the configs, the README and every inventory row the workspace suites check.
Each invariant it satisfies is held by the suite that reads it, named in `scripts/src/services/package/new/`.

What the generator cannot decide is the package's purpose: write its `--description`, then its spec
(`openspec/specs/<name>/`, the `openspec` skill) by hand. Then run plain `pnpm i` from the repository root to link it.
