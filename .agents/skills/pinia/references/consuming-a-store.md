# Consuming a Store

Read when a component, composable, service, test or another store takes a store in. The one-line rules are in `SKILL.md`; this page is their full statement, the grouping example and the cycle they avoid.

Applies **everywhere a store is consumed** — components, composables, services and **tests alike**. Tests are not exempt: a test that reaches into a store differently from the code it covers stops being a description of how the store is used.

- **One binding per store, named after it** — `const fooBarStore = useFooBarStore()`, then `storeToRefs(fooBarStore)` and `const { method } = fooBarStore` (`pinia-store/require-store-binding` refuses every other shape). A qualifier goes in front of the whole name (`newCacheStore`). A runtime selector is not an exception: `useBattleMonsterStore(isEnemy)`, or a ternary between two stores, is still bound once under the name of the store the caller asked for. A bare `useFooStore()` statement run for its setup, and a function returning the store to its caller, have nothing to name.
- **`storeToRefs` and `defineStore` are auto-imported** — never `import { storeToRefs } from "pinia"`.
- Keep each store's lines grouped — fully extract one store before the next, never all inits, then all refs, then all methods. Order per store: `const xyzStore = useXyzStore()`, then `const { ref1 } = storeToRefs(xyzStore)`, then `const { method1 } = xyzStore` (omit either line if empty).
- Never use dot-access (`store.method()`) in components. Enforced: `no-restricted-syntax` in the `.vue` configs bans a member expression on a lower-camel `*Store` identifier, on both the script and template sides.
- **A store's id is its path under `app/store/`**, with a trailing `/index` dropped — `store/resource/sheet/row.ts` is `"resource/sheet/row"`. Asserted by `app/store/index.test.ts`, so a drifting id fails on the line that writes it.
- **Store-to-store** (inside a store file): declare nested stores at the root of the setup function, never `useXxxStore()` inside an action (repeated lookups). Access refs/computeds by dot syntax (`fooStore.bar`) to keep reactivity — **never `storeToRefs` inside a store**. Methods **must** be destructured at the root (`const { storeCreateFoo } = fooStore`), never called inline as `fooStore.method()`.
- **Stores reach each other one way only — no module cycle, auto-imports included.** Pinia tolerates two stores that call each other at setup, but the modules under them do not: a binding read while its module is still evaluating throws `Cannot access '…' before initialization` from an async component loader. The cycle is usually a store calling an orchestrating composable that reaches back into it; the orchestration belongs in the composable, and the store takes the read as a function (`useOpenThread` handing `openThread` its read, as a room's page read hands the data store its query), or the predicate moves to the module that owns its data. A "read through the store rather than destructured, it is still the partial store" comment is this cycle's workaround — remove the cycle, not the destructure. Enforced by `import/no-cycle` for written imports and `app/moduleCycles.test.ts` for the auto-imported ones (`oxlint` skill, `references/import-rules.md`).

```ts
// each store fully extracted before the next
const fooStore = useFooStore();
const { foos } = storeToRefs(fooStore);
const { createFoo } = fooStore;

const barStore = useBarStore();
const { bars } = storeToRefs(barStore);
const { deleteBar } = barStore;
```
