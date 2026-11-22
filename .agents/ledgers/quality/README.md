# Quality

The question is the code-review skill's quality lane: reuse, simplification, efficiency and altitude. Whether a unit repeats code or a constant a shared place already holds, and whether its code is simpler, cheaper or better placed than it is, are read off the unit's own files.

## Areas

The areas and their units are the shared [area list](../areas/), and `pnpm ai:sweep:status quality` says where each unit stands. It keeps an area file only for the units it holds a note on: [app-shell](app-shell.md), [dungeons](dungeons.md), [packages](packages.md), [products](products.md), [resource](resource.md), [shared](shared.md) and [tooling](tooling.md).md), [dungeons](dungeons.md), [packages](packages.md), [products](products.md), [resource](resource.md), [shared](shared.md) and [tooling](tooling.md). A pass loads this file, the area's file in the list and this ledger's file for the area where it has one.

[duplicate-code](duplicate-code.md) is this ledger's own area: every run of code two files share, found by `pnpm ai:sweep:duplicate-code` over the code scopes. Its rules are in the section below.

## Duplicate code

Every run of code two files share, found by `pnpm ai:sweep:duplicate-code` over the code scopes, with tests, generated
output, declarations, import blocks and drawn assets left out (the finder's
`constants.ts` says why for each, except import blocks, which `scripts/src/services/sweeps/duplicateCode/getDuplicateCodeFindings.ts` explains). The workspace suite's zero test (`scripts/src/workspace/duplicateCode.test.ts`)
holds the whole scan to no finding, and the coverage shards that run the scripts suite are the gate. The finder passes
jscpd every value it needs, so the repository holds no `.jscpd.json`.

Where a finding's home looked missing, it is settled:

- **Across packages:** isomorphic code goes to `@esposter/shared`, and server-only code to `@esposter/shared-node`. Otherwise it goes to the lowest package both sides already depend on. A gap there is filled, not worked around.
- **Parallel Drizzle tables:** they share column builders, as the metadata columns already do. Where two tables name one concept differently, a `db:gen` migration renames the columns to the shared builder's names.
- **The standalone plugins** (`follow-ups`, `genshin-persona`): they carry no `@esposter/shared`, so a helper one needs is written in its own package.
- **Claude mods:** a pure helper is shared through a relative import inside the plugin (the register exception is below).
- **Styles:** they are shared through a shared component or stylesheet, and the visual suites stay unchanged. A style edit is never landed through a `-u`.
- **Measured data:** a clone made only of numeric literal rows, or of keyed empty collections (`key: [],`, `key: {},`, an object of only those), is data, not code. The finder skips it.
- **Across Claude plugins:** a clone whose two sides sit in two different plugins (a package with a `.claude-plugin` folder) is not a finding, since each plugin installs standalone with no build and cannot share a file.
- **Engine-bound register code:** a clone of two `register*.ts` files under a plugin's `src/services` is not a finding, since the engine keeps each `$` call and atom in its own register file. A pure helper in any other file stays a finding.
- **Declarations and component preamble:** a clone made only of imports, interface and type bodies, `defineProps`, `defineEmits` and `defineModel` calls, bare composable bindings, a composable's destructured call (`const { … } = useName(…);`) of bare names or `name: alias` entries, or a `return { … }` of bare names is each file's own list of what it holds, not logic. The finder skips it.
- **A clone's edges:** a clone runs from token to token, so the finder reads it as the lines it covers whole. A statement it touches only at its first or last token, and a comment left at either edge, are not part of it.
- **Value-set-keyed record rows:** a clone made only of the rows of a `Record` keyed by a value set is data a table holds. The finder skips it.
- **A kind's generic signature:** every composable that takes a page-builder kind repeats the kind's four generics, so a copy of that signature is a finding by construction. The signature is wrapped in `// jscpd:ignore-start` and `// jscpd:ignore-end`, with a comment above it saying why. Each wrap is one reviewed exemption at its site, and the gate still runs over everything else. A clone of the composables' bodies is not exempt: the body moves into the shared composable (`usePageBuilderSelectedNode`).

## Exclusions

Excluded: `CHANGELOG.md` (lerna output).
