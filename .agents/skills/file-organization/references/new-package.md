# Creating a new workspace package

Read when a workspace package is being created, or when a package's scaffold or its inventory rows are wrong. A package is created by `pnpm ai:package:new <name> [--kind library|nuxt-module|plugin] [--description "..."] [--register]`.
It writes the manifest, the configs, the README and every inventory row the workspace suites check.
Each invariant it satisfies is held by the suite that reads it, named in `scripts/src/services/package/new/`.

What the generator cannot decide is the package's purpose: write its `--description`, then its spec
(`openspec/specs/<name>/`, the `openspec` skill) by hand. Then run plain `pnpm i` from the repository root to link it.

Its npm steps are the owner's: `references/npm-lifecycle.md`.

## Keywords

The generator writes none, since which words describe a package is its author's judgement. A published package carries five to ten, lowercase and hyphenated, each one a word a stranger would search for: what the package is (`tmx`, `parser`), what it plugs into (`vue`, `nuxt-module`, `phaser`), the format, protocol or library it speaks, and the problem it solves. Leave out `typescript`, since npm shows a package's types itself, and the words true of every package here (`monorepo`, `shared`, `npm`). One spelling per word, so `pdfjs` and never `pdf.js` beside it, and nothing the package's own name already says. `scripts/src/workspace/packageKeywords.test.ts` holds the count, the shape and the left-out words, and a new package fails it until its keywords are written. A private package carries none, since nothing lists it. Which words are right is read against the description and the README, never derived.
