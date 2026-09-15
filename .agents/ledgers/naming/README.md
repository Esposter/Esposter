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

## Next enforceable

- Filename-is-the-export is decidable from the AST plus the path; a custom oxlint plugin could take it whole.
- `is*`/`has*`/`show*` on a boolean-typed declaration needs types, which `typeAware: true` already provides.
  The **function** half of that needs no types at all: a declarator named `^(is|has)[A-Z]` whose initialiser is
  an arrow or function expression with an explicit `: boolean` return annotation is decidable from the AST, and
  every one found so far writes that annotation. A `no-restricted-syntax` selector can hold it over the swept
  paths and widen as the six remaining `exec` ones drain.
- Abbreviation bans need a word list, not a rule — leave with the sweep.
- A `<script setup>` constant's casing is not decidable by selector: whether a top-level array or object
  literal is fixed or captures a ref needs scope analysis no `no-restricted-syntax` pattern can do, and the
  narrow branch that is decidable (`Object.values`/`entries`/`keys` at program scope) catches a fraction of
  the sites. Leave with the sweep.
- A where-fragment helper is decidable from the AST alone: a declarator named `*Where` whose initialiser is a
  function must start with `get`. Four routers had written the bare noun, so the rule is now in the `trpc` skill
  and a `no-restricted-syntax` selector can hold it over the swept paths.
- A redundant alias is decidable from the AST alone: a declarator whose initialiser is a bare identifier declared
  in the same scope binds a second name to a value that already has one. Every instance so far is a
  `Promise.withResolvers` destructured under one name and immediately re-bound under another, and the fix is
  always to destructure to the name the test actually reads.
- A `const` bound to the call it names — `const readPost = await caller.readPost(…)` — is decidable from the AST alone
  (declarator name equal to the callee's last property), and it is the finding this ledger has now written in five
  files. The fix is always the same: drop the verb prefix, since the binding is the value rather than the fetch.
- A bare `_` binding cannot go to `id-denylist`: xml2js spells an element's text as the `_` key, so
  `packages/parse-tmx` and `packages/xml2js` destructure and declare it by that name throughout, and the ban
  would buy a disable per site. The sweep keeps the rule — `_value`, `_title`, `_match`, never bare — by hand.
