---
name: typescript
description: Esposter TypeScript conventions — banned patterns (Omit over Except, forEach, parameter properties, mutating array methods, the void operator), as unknown as treated like any, arrow functions, callbacks never taking a bare function reference, regex literals, neverthrow promise style and the void ban, guard clauses and if/else-if chains, exhaustive switch guards, inferred return types, for...of loops with .entries(), Array.from over spread+map, environment constants, stable selection IDs, filter narrowing, plus deep dives on enum declaration/values arrays/refs, the "" sentinel and null-vs-undefined, modelling types instead of casting (Pick from source types, discriminant-keyed dispatch maps, nuxt.d.ts augmentation), function signatures (overloads, parameter defaults, boolean flags), the floating-promise replacement ladder, and declare over ! on class fields. Apply when writing any TypeScript in this project.
---

# TypeScript Conventions

## Deep dives

- `references/enums.md` — when declaring an enum, its Zod schema, its values array, or a ref that holds one.
- `references/absent-values.md` — when a value can be empty or absent: a string ref, an optional field, a cursor, a nullable boundary type.
- `references/type-modelling.md` — when reaching for a cast, re-declaring fields a source/SDK type already has, dispatching per variant, or a `NuxtConfig` key the compiler can't see.
- `references/function-signatures.md` — when writing a function's parameters: overloads, an options object, a default, or a boolean flag.
- `references/floating-promises.md` — when a lint error flags a floating promise, or an async function must be called from a sync slot.
- `references/class-fields.md` — when adding a field to a class.

## Core Rules

- `strict` mode + `tseslint.configs.strictTypeChecked`. `any`, non-null assertions (`!`), and `==`/`!=` are lint errors (`no-explicit-any`, `no-non-null-assertion`, `eqeqeq`) — for `!` prefer a guard clause or optional chaining over a cast, and a field with no initializer takes `declare` rather than `!` (`references/class-fields.md`).
- `Omit` → `Except` from `type-fest`, enforced by `@typescript-eslint/no-restricted-types`. Import it from `type-fest` directly; it is **not** re-exported from `@esposter/shared`.
- **No parameter properties** — never `constructor(private readonly foo: T)`. Declare fields explicitly and assign in the body.
- **`private` → ECMAScript `#`** (`no-restricted-syntax` in `packages/configuration/eslint/typescriptRules.js`). Keep `readonly` when converting (`private readonly foo` → `readonly #foo`); `protected` stays, as `#` is inaccessible to subclasses.
- `.forEach()` is **BANNED** — use `for...of` (see Loops). Not lint-enforced; hold the line in review.
- `type` aliases for object shapes → `interface` (`consistent-type-definitions`).
- **Prefer non-mutating array methods** — `arr.toSorted(fn)` (`sort()` **BANNED**), `arr.toReversed()` (`reverse()` **BANNED**), `arr.toSpliced(...)` (`splice()` **BANNED** for producing new arrays, still allowed for in-place mutation of store/reactive arrays), and `arr.with(index, value)` over `[...arr.slice(0, i), value, ...arr.slice(i + 1)]`.
- **`new Set` only for dedup** — use `.some()` for unique arrays. `Set` only when (a) deduplication is the goal, or (b) the collection is large enough that O(n) `.some()` hurts perf.
- **Never declare what nothing uses** — every export (schema, type, constant, pluralized enum array) earns its existence with a call site; no speculative API. When removing the last consumer of an export, cascade-delete the newly orphaned export and its now-unused imports too.
- Named imports from libraries, but only when not auto-imported by Nuxt/modules (`ref`, `computed`, `watch` from Vue; `storeToRefs` from Pinia; all VueUse composables are auto-imported — never import manually).
- **Node built-ins take the `node:` protocol** (`unicorn/prefer-node-protocol`) — but **never import an ambient global**: `process`, `console`, `Buffer`, `URL` and `fetch` are already there, so only the non-ambient built-ins are imported at all.
- **Never generic variable names like `parsed`** — use a name including the type: `parsedDate`, `parsedResult`.
- **No `current*` caching of `.value`** just to use it once. If narrowing is needed after a guard, assign a descriptive name (`const selectedFile = file.value`). Prefer plain `const` over `computed()` when the source is already non-reactive (e.g. a `readonly` prop field).
- **Cloning** — `structuredClone(obj)` for deep clones; `Object.assign(structuredClone(obj), { ...updates })` to clone+override. Never `{ ...spread }` to clone a class instance (loses prototype). **Exception**: `structuredClone(new ClassName(...))` when a plain object is explicitly required (e.g. Vjsf rejects class instances) — add a comment explaining why.
- **Boolean casting** — never `!!`; always `Boolean(value)`.
- **Regex** — literals for static patterns, `new RegExp(template, flags)` only when the pattern interpolates, and always the `u` flag; all three are lint errors otherwise (`prefer-regex-literals`, `require-unicode-regexp`). Naming (`_REGEX`) is the `naming` skill's rule.
- **Prefer the shortened assignment forms** — compound (`x += y`, `x ??= y`) over `x = x + y`, chained (`a.value = b.value = value`) over repeating the right-hand side. `restrict-plus-operands` and `no-multi-assign` are off for exactly this reason: a cast to silence a lint rule is strictly worse than the operator it replaces.
- **`as unknown as T` is `any` with extra steps** — it launders a value past every check, isn't lint-enforceable, and needs a stated reason the type cannot be modelled; the default answer is that it never was. Prefer a single `as T` where TS accepts it, and comment what the compiler cannot see — never "this is safe".
- **A compiler limit is a `@ts-expect-error`, not a redesign.** TS2590 fires where a large component instance type meets a composable's element union. Suppress in place, tagged with the code and message: `// @ts-expect-error TS2590: Expression produces a union type that is too complex to represent.` Never move a template ref to another element to dodge it — the directive fails the build once the error stops firing, where the workaround silently changes what the ref points at.
- **Never `Object.values(SomeEnum)` inline**, and never abbreviate an enum value name (`Configuration`, not `Config`).
- **Track selections by stable ID, not name or index** — names change, indices shift on delete/reorder. Use `entity.id` (UUID) as the key for selected/active items. A stale ID is harmless; a stale name/index is a bug.

## Functions

- **Always arrow functions** — `const fn = () => { ... }`. The `function` keyword is only for cases where `this` binding is required: class methods, object methods referencing `this`, generators (`function*`). Everything else (module-level, composables, callbacks, helpers) must be an arrow function.
- **Never pass a function reference as a callback** — wrap it: `array.map((item) => fn(item))`, `onUnmounted(() => { reset(); })`. A bare reference forwards every argument the caller supplies (`.map` passes the index) and loses `this` binding on a method. Applies to array methods, lifecycle hooks and event listeners alike.
- **Prefer inferred return types** — annotate only when (a) the inferred type is too broad and you want a narrower contract (e.g. `ComputedRef<ValidationRule>` instead of `ComputedRef<(value: string) => string | true>`), or (b) the function is a public API boundary. Never annotate for documentation, service functions included.
- **Don't extract helpers that add no value** — if a helper just wraps an inline object literal or single expression without reuse or meaningful abstraction, use the value directly. Three lines of inline code beats a named wrapper used once.

## Promise Style

- **`try`/`catch` is BANNED** for fallible work — use neverthrow `getResult`/`getResultAsync` (+ `withFinalizer`/`withFinalizerAsync` for cleanup, never `try`/`finally`); never `.catch()` chains. **`new Error(...)` is banned too** — a throw is an `InvalidOperationError`. Both subjects in full, plus `jsonDateParse` for any JSON round trip carrying dates, are the **error-handling** skill's.
- **`.then()` exception**: acceptable only for a **promise queue** (serialising sequential async ops in a sync context, e.g. `chain = chain.then(async () => {...})`) — can't be expressed with `await` in a sync watcher/callback. All other `.then()`/`.catch()` must be converted.
- **Never `await import(...)`** for code-splitting — always a static top-level `import`. The build already chunk-splits per component, so a nested dynamic import only hides the dependency and, in dev, defers Vite's discovery until first use, which can trigger a mid-session re-optimization leaving chunks on stale dep hashes. Only touch `optimizeDeps` when the dependency's own docs instruct it. Sole exception: a library-mandated lazy-loader contract.

- **`void asyncFn()` is banned** (`no-void`) — it silences `no-floating-promises` by discarding the promise, so rejections go unhandled and the caller cannot await completion. The replacement ladder (make the caller `async`, widen the callback to `Promisable<void>`, `getSynchronizedFunction` as the last resort) is `references/floating-promises.md`.

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
- **Destructure in the binding position (loop var, function param) straight to the props you use** — `for (const [i, { id }] of files.entries())`, never binding the whole object and then reading its fields. This _removes_ a binding, so it does not conflict with the ban on a separate `const { x } = obj` line for a single use. Keep the whole binding only when the object is passed on whole, or used too many ways to enumerate cleanly.
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
