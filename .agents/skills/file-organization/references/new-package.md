# Creating a new workspace package

Read when a workspace package is being created, or when a package's scaffold or its inventory rows are wrong. A package is created by `pnpm ai:package:new <name> [--kind library|nuxt-module|plugin] [--description "..."] [--register]`.
It writes the manifest, the configs, the README and every inventory row the workspace suites check.
Each invariant it satisfies is held by the suite that reads it, named in `scripts/src/services/package/new/`.

What the generator cannot decide is the package's purpose: write its `--description`, then its spec
(`openspec/specs/<name>/`, the `openspec` skill) by hand. Then run plain `pnpm i` from the repository root to link it.

Its npm steps are the owner's: `references/npm-lifecycle.md`.

## Keywords

The generator writes none, since which words describe a package is its author's judgement, and the new package fails `scripts/src/workspace/packageKeywords.test.ts` until they are written. That test holds their count, shape and the words left out, the links beside them, and that a private package carries none. What it cannot hold is the choice: each word is one a stranger would search for, naming what the package is (`tmx`, `parser`), what it plugs into (`vue`, `nuxt-module`, `phaser`), the format, protocol or library it speaks, and the problem it solves. A word the package's name already holds is repeated only where it is also the term people search. A technology is named only where the package uses it or is checked against it, never one it merely resembles, and one spelling stands for a word. Read each list against the description and the README.
