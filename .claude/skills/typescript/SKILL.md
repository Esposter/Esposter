---
name: typescript
description: Esposter TypeScript conventions — banned patterns (Omit over Except, forEach, parameter properties, mutating array methods, the void operator), as unknown as treated like any, declare over ! on class fields, arrow functions, regex literals, neverthrow promise style and the void-asyncFn replacement ladder, InvalidOperationError, guard clauses and if/else-if chains, exhaustive switch guards, inferred return types, for...of loops with .entries(), Array.from over spread+map, environment constants, stable selection IDs, filter narrowing, plus deep dives on enum declaration/values arrays/refs, the "" sentinel and null-vs-undefined, modelling types instead of casting (Pick from source types, discriminant-keyed dispatch maps, nuxt.d.ts augmentation), and function signatures (overloads, parameter defaults, boolean flags). Apply when writing any TypeScript in this project.
---

# TypeScript Conventions

## Deep dives

- `references/enums.md` — when declaring an enum, its Zod schema, its values array, or a ref that holds one.
- `references/absent-values.md` — when a value can be empty or absent: a string ref, an optional field, a cursor, a nullable boundary type.
- `references/type-modelling.md` — when reaching for a cast, re-declaring fields a source/SDK type already has, dispatching per variant, or a `NuxtConfig` key the compiler can't see.
- `references/function-signatures.md` — when writing a function's parameters: overloads, an options object, a default, or a boolean flag.

## Core Rules

- `strict` mode + `tseslint.configs.strictTypeChecked`. `any`, non-null assertions (`!`), and `==`/`!=` are lint errors (`no-explicit-any`, `no-non-null-assertion`, `eqeqeq`) — for `!` prefer a guard clause or optional chaining over a cast, and see Class Fields for the `field!: T` form.
- `Omit` → `Except` from `type-fest`, enforced by `@typescript-eslint/no-restricted-types`. Import it from `type-fest` directly; it is **not** re-exported from `@esposter/shared`.
- **No parameter properties** — never `constructor(private readonly foo: T)`. Declare fields explicitly and assign in the body.
- **`private` → ECMAScript `#`** (`no-restricted-syntax` in `packages/configuration/eslint/typescriptRules.js`). Keep `readonly` when converting (`private readonly foo` → `readonly #foo`); `protected` stays, as `#` is inaccessible to subclasses.
- `.forEach()` is **BANNED** — use `for...of` (see Loops). Not lint-enforced; hold the line in review.
- `type` aliases for object shapes → `interface` (`consistent-type-definitions`).
- **Prefer non-mutating array methods** — `arr.toSorted(fn)` (`sort()` **BANNED**), `arr.toReversed()` (`reverse()` **BANNED**), `arr.toSpliced(...)` (`splice()` **BANNED** for producing new arrays, still allowed for in-place mutation of store/reactive arrays), and `arr.with(index, value)` over `[...arr.slice(0, i), value, ...arr.slice(i + 1)]`.
- **`new Set` only for dedup** — use `.some()` for unique arrays. `Set` only when (a) deduplication is the goal, or (b) the collection is large enough that O(n) `.some()` hurts perf.
- **Never declare what nothing uses** — every export (schema, type, constant, pluralized enum array) earns its existence with a call site; no speculative API. When removing the last consumer of an export, cascade-delete the newly orphaned export and its now-unused imports too.
- Named imports from libraries, but only when not auto-imported by Nuxt/modules (`ref`, `computed`, `watch` from Vue; `storeToRefs` from Pinia; all VueUse composables are auto-imported — never import manually).
- **Use the `node:` protocol for Node.js built-ins** — `import { readFileSync } from "node:fs"`, never bare `"fs"`/`"path"`/`"crypto"`. Enforced by `unicorn/prefer-node-protocol`.
- **Never import ambient globals** — `process`, `console`, `Buffer`, `URL`, `fetch`, etc. are already global; use them directly, never `import process from "node:process"`. Only import the built-ins that aren't ambient.
- Explicitly type variables with proper types.
- **Never generic variable names like `parsed`** — use a name including the type: `parsedDate`, `parsedResult`.
- **No `current*` caching of `.value`** just to use it once. If narrowing is needed after a guard, assign a descriptive name (`const selectedFile = file.value`). Prefer plain `const` over `computed()` when the source is already non-reactive (e.g. a `readonly` prop field).
- **Cloning** — `structuredClone(obj)` for deep clones; `Object.assign(structuredClone(obj), { ...updates })` to clone+override. Never `{ ...spread }` to clone a class instance (loses prototype). **Exception**: `structuredClone(new ClassName(...))` when a plain object is explicitly required (e.g. Vjsf rejects class instances) — add a comment explaining why.
- **Boolean casting** — never `!!`; always `Boolean(value)`.
- **Regex** — literals for static patterns, `new RegExp(template, flags)` only when the pattern interpolates, and always the `u` flag; all three are lint errors otherwise (`prefer-regex-literals`, `require-unicode-regexp`). Naming (`_REGEX`) is the `naming` skill's rule.
- **Prefer the shortened assignment forms** — compound assignment (`x += y`, `x ??= y`) over `x = x + y`, and chained assignment (`a.value = b.value = value`) over repeating the right-hand side. `typescript/restrict-plus-operands` and `no-multi-assign` are off in `.oxlintrc.json` for exactly this reason: a `+=` on a `Record<string, unknown>` value is kept as-is rather than widened into a cast, since a cast to silence a lint rule is strictly worse than the operator it replaces.
- **`as unknown as T` is `any` with extra steps** — it launders a value past every check, isn't lint-enforceable, and needs a stated reason the type cannot be modelled; the default answer is that it never was. Prefer a single `as T` where TS accepts it, and comment what the compiler cannot see — never "this is safe".
- **A compiler limit is a `@ts-expect-error`, not a redesign.** TS2590 fires where a large Vuetify component instance meets a VueUse composable's element union. Suppress in place, tagged with the code and message: `// @ts-expect-error TS2590: Expression produces a union type that is too complex to represent.` Never move a template ref to another element to dodge it — the directive fails the build once the error stops firing; the workaround silently changes what the ref points at.
- **Never `Object.values(SomeEnum)` inline**, and never abbreviate an enum value name (`Configuration`, not `Config`).
- **Track selections by stable ID, not name or index** — names change, indices shift on delete/reorder. Use `entity.id` (UUID) as the key for selected/active items. A stale ID is harmless; a stale name/index is a bug.

## Class Fields — `declare` over `!`

For a class field with **no inline initializer** (value provided by `Object.assign(this, init)`, a parent/mixin constructor, external assignment, or a pure phantom type carrier), use `declare`, **never** `!`.

**Why**: `declare` emits no field declaration, avoiding the `useDefineForClassFields` footgun where an emitted `field = undefined` runs after `super()` and clobbers a value set by a parent/mixin. `!` only suppresses the strict-init error while still emitting the clobbering initializer.

- Applies to all fields lacking an inline initializer: phantom type carriers, `Object.assign`-populated entity models (`AzureEntity`/`CompositeKeyEntity`/`*MessageEntity`), externally-assigned fields.
- **Keep the inline initializer** for fields that have one (`id: string = crypto.randomUUID()`) — never convert to `declare` (that drops the runtime default); they're mutually exclusive.
- Optional fields (`direction?: Direction`) are already correct — leave them.

## Functions

- **Always arrow functions** — `const fn = () => { ... }`. The `function` keyword is only for cases where `this` binding is required: class methods, object methods referencing `this`, generators (`function*`). Everything else (module-level, composables, callbacks, helpers) must be an arrow function.
- **Prefer inferred return types** — annotate only when (a) the inferred type is too broad and you want a narrower contract (e.g. `ComputedRef<ValidationRule>` instead of `ComputedRef<(value: string) => string | true>`), or (b) the function is a public API boundary. Never annotate for documentation, service functions included.
- **Don't extract helpers that add no value** — if a helper just wraps an inline object literal or single expression without reuse or meaningful abstraction, use the value directly. Three lines of inline code beats a named wrapper used once.

## Promise Style

- **`try`/`catch` is BANNED** for fallible work — use neverthrow `getResult`/`getResultAsync` (+ `withFinalizer`/`withFinalizerAsync` for cleanup, never `try`/`finally`); never `.catch()` chains. Full patterns, utilities, consumption rules, and Azure Functions logging/retry live in the **error-handling** skill.
- **`.then()` exception**: acceptable only for a **promise queue** (serialising sequential async ops in a sync context, e.g. `chain = chain.then(async () => {...})`) — can't be expressed with `await` in a sync watcher/callback. All other `.then()`/`.catch()` must be converted.
- **Never `await import(...)`** for code-splitting — always static top-level `import`. Components are already chunk-split per component by the build, so a nested dynamic import only hides the dependency and (in dev) defers Vite discovery until first use, which can trigger a mid-session re-optimization leaving chunks referencing stale dep hashes. Only touch `optimizeDeps` when the dependency's own docs instruct it. Sole exception: a library-mandated lazy-loader contract (e.g. CodeMirror `LanguageDescription.of({ load })`).

### Replacing `void asyncFn()`

`no-void` is an error (`.oxlintrc.json`, covering `.ts` and `.vue`) because it silences `no-floating-promises` by discarding the promise — rejections go unhandled and the caller can't await completion. `getSynchronizedFunction` is the one place permitted to use it, being the sanctioned fire-and-forget primitive. Stop at the first step that applies:

1. **Can the enclosing function be `async`?** Make it `async` and `await`. This covers nearly every case, including Vue template/emit handlers (`@click`, `@confirm`) and any callback typed `Promisable<void>` — Vue doesn't care that a handler returns a promise.
2. **Do you own the callback's type?** Widen it to `Promisable<void>` (`type-fest`) and `await` it at the call site. Never force callers to `void` their async work. Always the `Promisable<T>` alias — never a hand-written `Promise<T> | T` union, for every maybe-async signature.
3. **Third-party sync slot you genuinely cannot change** (`onScopeDispose`, `addEventListener`, Phaser callbacks) — wrap with `getSynchronizedFunction(asyncFn)` (`#shared/util/function/getSynchronizedFunction`, explicit import). It drops the promise just like `void`, so it's a last resort, not a shortcut past steps 1–2.

If none apply (sync body, no callback slot to widen), restructure so the sync teardown stays sync and the promise is awaited last — don't `void` it.

## Error Handling

- **Never `new Error(...)`** — throw `new InvalidOperationError(operation, name, message)` from `@esposter/shared`, picking the appropriate `Operation` value (`Operation.Read`/`Create`/`Update`/`Delete`, …). Use the resource name (`file.name`, entity ID) as `name`; fall back to the calling function's name (`deserializeJson.name`) if none better.
  - **Exception: the unimplemented interface stub.** `throw new Error("Method not implemented.")` stays as-is where a mock implements a wide vendor interface it only partly needs (`packages/azure-mock`, ~80 sites). There is no operation being attempted and no resource to name, so every field of `InvalidOperationError` would be filler; nothing catches or logs it, because reaching one means a test called a method the mock was never meant to serve. It is also what TypeScript's own "implement all members" fix writes, so the stubs stay diff-identical to regenerated ones. Don't route these through a shared `getNotImplementedError()` either — the indirection buys nothing at a site whose entire body is the throw.
- User-supplied JSON (uploads, external input): Zod `safeParse` and throw `InvalidOperationError` on failure — never bare `JSON.parse` with a cast. Validated endpoint data may use `jsonDateParse` from `@esposter/shared`.
- **JSON containing dates** (localStorage, blobs, any `JSON.stringify` round trip): parse with `jsonDateParse` — its reviver restores ISO strings to `Date`s, so the Zod schema keeps plain `z.date()`. Never `JSON.parse` + `z.coerce.date()`.

## Control Flow

- **Guard clauses first** — `if (!condition) return` to exit early instead of wrapping the body in `if`. Invert and return early aggressively.
- **One guard per outcome, not one per condition** — consecutive guards whose bodies are identical collapse into one with `||` wherever the conditions are independent. Splitting them reads as though the branches differ and invites a later edit to give one its own body, which is how two conditions that must stay in lockstep drift apart. Keep them split when the bodies genuinely differ (a distinct throw, a log, a different return value), or when the second condition depends on the first having passed or has side effects — `if (!a) return; if (a.b) return;` throws once merged.
- **Do not convert balanced `if/else` into a guard clause** — guards are only correct when the remainder of the function is the single happy path. When two branches are parallel paths of similar weight, keep `if/else`; converting either duplicates shared steps or obscures mutual exclusivity. A reviewer suggesting "use a guard clause" is a false positive when the `else` branch contains substantial work.
- **Always use `if/else if/else` from the first branch** — no standalone `if` followed by `else if`, even when the first branch is a guard clause: `if (!x) return; else if (y) return z;` is correct. Only omit `else` when branches are genuinely independent (different concerns, not a logical chain).
- **Use `switch` for type-based branching** — branching on an enum/discriminant with multiple cases uses `switch`, not an `if/else if` chain. Use `if/else if/else` only for non-enum expressions or exactly two branches. Never switch over a discriminant purely to dispatch different logic per case — key a map by the discriminant instead (`references/type-modelling.md`).
- **Every `switch` on an enum or discriminated-union discriminant needs `default: exhaustiveGuard(value)`** (or `return exhaustiveGuard(value)` in return-position), imported from `@esposter/shared`, so a new variant is a compile error. Nested switches each need their own guard. **Exception**: switches on non-enum values (strings, numbers, class instances).
- **Use `.includes()` for 2+ equality checks** — `[A, B].includes(x)` not `x === A || x === B`. Extract to a named constant only if reused.
- **No redundant type guards after a filtering condition** — if a `.filter()` predicate narrows the type (`filter((v) => typeof v === "number")`), the result is already `number[]`; don't add `: v is number` or a cast inside the callback. Exception: a predicate passed as a function reference (`filter(Boolean)`) can't narrow, so a type predicate is still needed.

## Loops and Iteration

- **`Array.from(iterable, mapFn)` over `[...iterable].map(mapFn)`** for any `Set`/`Map`/non-array iterable — the two-arg form maps while converting, producing no intermediate array. A `Map` iterates as `[key, value]` with no `.entries()` needed: `Array.from(fooMap, ([key, value]) => ({ key, value }))`. Spread + `.map()` is only acceptable when a plain array is already the source.
- **No index-based `for (let i = 0; i < arr.length; i++)`** for plain array iteration — use `for...of`, and `.entries()` when the index is needed (`for (const [i, item] of arr.entries())`). The `.entries()` iterator cost is negligible (tiny per-element pair alloc, JIT-friendly) versus the readability win.
- **Index-based `for` stays** only when the loop genuinely isn't sequential array iteration: step counters (`i += 4`, `i += BATCH_SIZE`), pure counts (`for (let i = 0; i < 3; i++)`), `<=` bounds, multi-condition bounds, or in-body index mutation/lookahead (`line.charAt(i + 1)` then `i++`).
- **Destructure in the binding position (loop var, function param) straight to the props you use** — `for (const [i, { id }] of files.entries())`, not binding the whole object then reading its fields. This _removes_ an intermediate binding, so it does **not** conflict with the "no unnecessary destructure" rule (which bans adding a separate `const { x } = obj` line for a single use). Keep the whole binding only when the object is passed on as a whole (`set(user.id, user)`) or used too many ways to enumerate cleanly.
- **Don't declare intermediate vars that are used once** — inline single-use values; only name a var when it's referenced more than once or the name adds clarity.
- **Bound a zip with `break`, not a dual condition** — iterate the driving array via `.entries()` and `if (i >= other.length) break;`.

## Environment Checks

**Never use `import.meta.dev` or `import.meta.env.MODE` directly** — use `IS_PRODUCTION`/`IS_DEVELOPMENT`/`IS_TEST` from `#shared/util/environment/constants`:

```ts
import { IS_PRODUCTION } from "#shared/util/environment/constants";
const baseUrl = IS_PRODUCTION ? PRODUCTION_URL : DEVELOPMENT_URL;
```

## Absent Values

- **`ref<string>()` is BANNED** — app-owned strings are `string` with `""` as the empty sentinel, checked by truthiness, never `string | undefined`.
- **A property whose absent form is `undefined` is declared `field?: T`, never `field: T | undefined`** (`no-restricted-syntax`), and `undefined` is banned in app-owned code unless it carries a meaning distinct from every real value. `null` is only permitted at the external system boundary (Drizzle, Azure SDK, a few Vuetify props).
- Full sentinel propagation rules, boundary exceptions and the enum-`None` ban: `references/absent-values.md`.
