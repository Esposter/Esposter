# JSON Checks

Read when changing what is checked in the repo's JSON, adding a JSONC file, or adding a generated JSON tree.

oxlint reads no JSON ([oxc#18656](https://github.com/oxc-project/oxc/issues/18656)), so the JSON checks are workspace tests rather than lint rules:

- `scripts/src/workspace/jsonFiles.test.ts` parses every tracked JSON and JSONC file with `jsonc-parser`. A strict file must parse as JSON, and a JSONC file (a tsconfig, a `.vscode` file, a `.jsonc` config) may hold comments and trailing commas. Both fail on a duplicate key, which `JSON.parse` would keep silently as the last one, and on an escape JSON never needs. Each rule the test holds has a fixture, so a check that stops reading its input fails rather than passing.
- `scripts/src/workspace/bannedDependencies.test.ts` fails a manifest whose `dependencies` or `devDependencies` names a package `module-replacements` records a replacement for.

**JSONC is a contract, not an extension.** A file whose consumer reads comments is listed in the test's JSONC patterns. Matched as strict JSON, its comment is a parse failure.

**Generated JSON is left out**: migration snapshots, asset exports and vitest snapshots are written and re-read by their generators. A new generated tree joins that list, and `oxfmt.config.ts`'s `ignorePatterns` is the cross-check, since the formatter and the test walk the same trees.

**Key order is not checked.** Alphabetical is the wrong order for a manifest (`description` before `version`) and for the generated files, so a manifest's `scripts` are kept alphabetical by hand.
