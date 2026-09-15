# Naming

## Areas

Coverage lives in the area file, never here. A pass loads this file and the one area it is sweeping. The
area names are [quality](../quality/)'s, so "was this area swept, for which question, and when" reads off
one set of names across every promoted ledger.

| Area                      | What it holds                                                                                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [app-shell](app-shell.md) | Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service and composable layers no single feature claims. |
| [messaging](messaging.md) | Esbabbler — its components, store, composables, services and models.                                                                                       |
| [resource](resource.md)   | The resource explorer, the sheet editor and the other editors.                                                                                             |
| [products](products.md)   | The app's smaller products — posts, the clicker, achievements, docs, the user pages and the standalone editors.                                            |
| [dungeons](dungeons.md)   | The game.                                                                                                                                                  |
| [server](server.md)       | `apps/web/server` — routers, procedure builders, guards and services.                                                                                      |
| [shared](shared.md)       | `apps/web/shared`, `app/components/Styled` and `packages/shared` — what both halves of the app read.                                                       |
| [packages](packages.md)   | Every workspace package outside `apps/web` and `packages/shared`.                                                                                          |
| [tooling](tooling.md)     | `scripts/`, `.agents/`, the app's root configuration and `content/`.                                                                                       |

A component file name is in scope for its **words** — the rule spelling `Navigation` over `Nav` reads a filename
the same way it reads any other identifier. The prefix-and-fold question over that same tree stays
`vue-components`'s: one tree, two questions, which is what keeps both ledgers whole. Nothing is excluded here on
the grounds that a rename is expensive — that is the argument
[no compatibility debt](/docs/architecture/no-compatibility-debt) already refuses, migrations included.

## Not enforceable — settled

What a program decides here it now decides: an `is*`/`has*` declarator holding a function with a `boolean`
or type-predicate return, and a `*Where` function not starting with `get`, are `no-restricted-syntax`
selectors in `packages/configuration/eslint/typescriptRules.js`; a binding named after the call that produced it
(`const readPost = await readPost(…)`) is `naming/no-call-named-binding` (`scripts/src/oxlint/naming.ts`);
`getIs*`, `can*`/`should*`, the `A` prefix on an interface, `InMessages` and the `<value>By<key>` map
spelling were selectors already. What is left stays a reading pass, for these reasons:

- **Filename-is-the-export** — a store file exports `use<Name>Store` for a `<name>.ts`, and takes its parent's
  word where the leaf collides (`battle/player.ts` → `useBattlePlayerStore`), so the derivation is a roster of
  store trees and carve-outs; `index.ts` and `constants.ts` are the two multi-export names beside it.
- **Abbreviations** need a word list, not a rule; only the four short forms with no site left are denylisted.
- **A `<script setup>` constant's casing** — whether a top-level literal is fixed or captures a ref needs scope
  analysis no selector has.
- **A redundant alias** (`const a = b`) — a bare identifier initialiser is also how a mutable binding is
  snapshotted before it is cleared (`const cleanup = currentCleanup; currentCleanup = undefined`), which syntax
  cannot tell from an alias; a trial selector reported fifty such sites and nothing else.
- **A bare `_` binding** cannot go to `id-denylist`: xml2js spells an element's text as the `_` key, so
  `packages/parse-tmx` and `packages/xml2js` declare it by that name throughout; and `no-underscore-dangle`
  refuses a prefixed loop declarator, so a loop binding nothing reads stays bare by lint's own rule.
