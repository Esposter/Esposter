# Quality

The question is the code-review skill's quality lane: reuse, simplification, efficiency and altitude. Whether a unit repeats code or a constant a shared place already holds, and whether its code is simpler, cheaper or better placed than it is, are read off the unit's own files.

## Areas

Coverage lives in the area file, never here. A pass loads this file and the one area it is sweeping.

| Area                                | What it holds                                                                                                                                                                                                                         |
| :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [app-shell](app-shell.md)           | Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service and composable layers no single feature claims.                                                                            |
| [dungeons](dungeons.md)             | The game is a fifth of the app's source. `components/Dungeons` splits at its sub-directories, and each row pairs a component group with the store, composable and service files that only it uses.                                    |
| [duplicate-code](duplicate-code.md) | Every run of code two files share, found by `pnpm ai:sweep:duplicate-code` over the code scopes. Its rules are in the section below.                                                                                                  |
| [messaging](messaging.md)           | Esbabbler — its components, store, composables, services and models.                                                                                                                                                                  |
| [packages](packages.md)             | Every workspace package outside `apps/web`, `packages/shared` and `packages/shared-node`. Grouped so each row is one review-sized commit.                                                                                             |
| [products](products.md)             | The app's smaller products — everything under `app/components` that is neither messaging nor the resource explorer. Each row carries a product's components together with the store, composable, service and page files only it uses. |
| [resource](resource.md)             | The resource explorer, the sheet editor and the other editors.                                                                                                                                                                        |
| [server](server.md)                 | `apps/web/server` — routers, procedure builders, guards and services.                                                                                                                                                                 |
| [shared](shared.md)                 | `apps/web/shared`, `app/components/Styled`, `packages/shared` and `packages/shared-node` — what both halves of the app read.                                                                                                          |
| [tooling](tooling.md)               | The repo's own scripts and the agent tree — code no product area claims. `scripts/`, `.agents/`, the app's root configuration and `openspec/`.                                                                                        |

## Duplicate code

Every run of code two files share, found by `pnpm ai:sweep:duplicate-code` over the code scopes, with tests, generated
output, declarations, import blocks, drawn assets and the Azure resource declarations left out (the finder's
`constants.ts` says why for each, except import blocks, which `scripts/src/services/sweeps/duplicateCode/getDuplicateCodeFindings.ts` explains). The workspace suite's zero test (`scripts/src/workspace/duplicateCode.test.ts`)
holds the whole scan to no finding, and CI's Duplicate Code job runs that file as the gate. Its config test holds
`.jscpd.json` to the finder's constants.

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
- **Enum-keyed record rows:** a clone made only of the rows of a `Record` keyed by an enum is data a table holds. The finder skips it.
- **A kind's generic signature:** every composable that takes a page-builder kind repeats the kind's four generics, so a copy of that signature is a finding by construction. The signature is wrapped in `// jscpd:ignore-start` and `// jscpd:ignore-end`, with a comment above it saying why. Each wrap is one reviewed exemption at its site, and the gate still runs over everything else. A clone of the composables' bodies is not exempt: the body moves into the shared composable (`usePageBuilderSelectedNode`).
