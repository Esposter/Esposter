---
name: typescript
description: Apply when writing any TypeScript in this project. Esposter TypeScript conventions — the banned patterns (Omit over Except, forEach, parameter properties, mutating array methods, the void operator, as unknown as), arrow functions with callbacks never a bare reference, regex literals with the u flag, neverthrow promise style, guard clauses and if/else-if chains, exhaustive switch guards, inferred return types, for...of with .entries(), a string-literal union as an enum, the "" sentinel with undefined over null, and modelling a type instead of casting.
---

# TypeScript Conventions

## Settled — do not re-propose

- **Turning `typescript/consistent-type-imports` on for `.vue`** — oxlint skips the rule there, since it cannot tell from the script block whether the template uses an import as a value, and nothing in the ESLint config reaches it; the `.ts` half is on (`disallowTypeAnnotations` off, because `vi.mock(import(…))` is the sanctioned Vitest idiom), so a class used only in type position takes `import type` by lint, and a `.vue` file keeps it by reading.

## Deep dives

- `references/enums.md` — when declaring an enum, its Zod schema, its values array, or a ref that holds one.
- `references/absent-values.md` — when a value can be empty or absent: a string ref, an optional field, a cursor, a nullable boundary type, or a character that renders as nothing.
- `references/collections.md` — when mutating an array, reading-or-inserting on a `Map`, choosing a `Set` over `.some()`, or narrowing what a `.filter()` returns.
- `references/type-modelling.md` — when reaching for a cast, re-declaring fields a source/SDK type already has, dispatching per variant, a `NuxtConfig` key the compiler can't see, or a TS2590 the compiler cannot represent.
- `references/control-flow.md` — when writing or reshaping a guard, an `if/else`, or a chain.
- `references/function-signatures.md` — when writing a function's parameters: overloads, an options object, a default, or a boolean flag.
- `references/floating-promises.md` — when a lint error flags a floating promise, or an async function must be called from a sync slot.
- `references/dynamic-imports.md` — when reaching for `await import(...)`, or a dependency's docs mention `optimizeDeps`.
- `references/class-fields.md` — when adding a field to a class.
- `references/loops.md` — when writing a loop: an index-based `for` that stays, binding-position destructuring, bounding a zip.

## Core Rules

- `strict` mode, with oxlint's type-aware rules on (`typeAware` in `.oxlintrc.json`). `any`, non-null assertions (`!`), and `==`/`!=` are lint errors (`no-explicit-any`, `no-non-null-assertion`, `eqeqeq`) — for `!` prefer a guard clause or optional chaining over a cast, and a field with no initializer takes `declare` rather than `!` (`references/class-fields.md`).
- `Omit` → `Except` from `type-fest`, enforced by oxlint `typescript/no-restricted-types`. Import it from `type-fest` directly; it is **not** re-exported from `@esposter/shared`.
- **No parameter properties** — never `constructor(private readonly foo: T)`. Declare fields explicitly and assign in the body.
- **`private` → ECMAScript `#`** (`no-restricted-syntax` in `packages/configuration/eslint/typescriptRules.js`). Keep `readonly` when converting (`private readonly foo` → `readonly #foo`); `protected` stays, as `#` is inaccessible to subclasses.
- `.forEach()` is **BANNED** — use `for...of` (`references/loops.md`); `unicorn/no-array-for-each` enforces it in script, `vue/no-restricted-syntax` in templates.
- `type` aliases for object shapes → `interface` (`consistent-type-definitions`).
- **Non-mutating array methods, enforced** — `sort()`, `reverse()` and `splice()` are lint errors; write `toSorted`/`toReversed`/`toSpliced` and assign the result back (`references/collections.md`).
- **Never hand-roll read-or-insert on a `Map`** — `getOrCreate(map, key, () => new Set())` from `@esposter/shared` (`references/collections.md`).
- **Never declare what nothing uses** — every export (schema, type, constant, pluralized enum array) earns its existence with a call site; no speculative API. When removing the last consumer of an export, cascade-delete the newly orphaned export and its now-unused imports too.
- Named imports from libraries, but only when not auto-imported by Nuxt/modules (`ref`, `computed`, `watch` from Vue; `storeToRefs` from Pinia; all VueUse composables are auto-imported — never import manually).
- **Node built-ins take the `node:` protocol** (`unicorn/prefer-node-protocol`) — but **never import an ambient global**: `process`, `console`, `Buffer`, `URL` and `fetch` are already there, so only the non-ambient built-ins are imported at all.
- **Never generic variable names like `parsed`** — use a name including the type: `parsedDate`, `parsedResult`.
- **No `current*` caching of `.value`** just to use it once. If narrowing is needed after a guard, assign a descriptive name (`const selectedFile = file.value`). Prefer plain `const` over `computed()` when the source is already non-reactive (e.g. a `readonly` prop field).
- **Cloning** — `structuredClone(obj)` for deep clones; `Object.assign(structuredClone(obj), { ...updates })` to clone+override. Never `{ ...spread }` to clone a class instance (loses prototype). **Exception**: `structuredClone(new ClassName(...))` when a plain object is explicitly required (e.g. a deep-equality dirty check that compares constructors) — add a comment explaining why.
- **Boolean casting** — never `!!`; always `Boolean(value)`.
- **Interpolation coerces** — `${x}`, never `${x.toString()}`; `no-restricted-syntax` enforces it (a radix `toString(16)` stays). `String(x)` inside a template is only for the types `restrict-template-expressions` rejects (`unknown`, `symbol`).
- **Regex** — literals for static patterns, `new RegExp(template, flags)` only when the pattern interpolates, and always the `u` flag; all three are lint errors otherwise (`prefer-regex-literals`, `require-unicode-regexp`). Naming (`_REGEX`) is the `naming` skill's rule.
- **A non-printing character is written as its `\uXXXX` escape, never the raw byte** — `RECORD_SEPARATOR = "\u001E"`. Settled, and the raw byte loses: it renders as nothing, so no reader can tell it from an empty string, from its neighbour, or from having been dropped by a tool that rewrote the line (`references/absent-values.md`). Enforced over every tracked file by `scripts/src/workspace/controlCharacters.test.ts`, because nothing else can see it: the character is invisible in an editor, in a diff and in a review alike.
- **Prefer the shortened assignment forms** — compound (`x += y`, `x ??= y`) over `x = x + y`, chained (`a.value = b.value = value`) over repeating the right-hand side. `restrict-plus-operands` and `no-multi-assign` are off for exactly this reason: a cast to silence a lint rule is strictly worse than the operator it replaces.
- **`as unknown as T` is `any` with extra steps** — a `no-restricted-syntax` error in source (`restrictedSourceSyntaxes.js`; a suite's fakes are exempt), so a surviving one is a disable naming what the compiler cannot see — never "this is safe"; the seams that earn one are `references/type-modelling.md`.
- **A compiler limit (TS2590) is a tagged `@ts-expect-error` in place, not a redesign** (`references/type-modelling.md`).
- **Never `Object.values(SomeEnum)` inline**, and never abbreviate an enum value name (`Configuration`, not `Config`).
- **A union of string literals is an enum** — `"delete" | "get"` becomes `enum HttpMethod` in its own model file and the annotation names it, enforced repo-wide by `literal-union/no-string-literal-union`. The four unions that are not sets, and what a genuine disable has to say: `references/enums.md`.
- **Track selections by stable ID, not name or index** — names change, indices shift on delete/reorder. Use `entity.id` (UUID) as the key for selected/active items. A stale ID is harmless; a stale name/index is a bug.

## Functions

- **Always arrow functions** — `const fn = () => { ... }`. The `function` keyword is only for cases where `this` binding is required: class methods, object methods referencing `this`, generators (`function*`). Everything else (module-level, composables, callbacks, helpers) must be an arrow function.
- **Never pass a function reference as a callback** — wrap it: `array.map((item) => fn(item))`, `onUnmounted(() => { reset(); })`. A bare reference forwards every argument the caller supplies (`.map` passes the index) and loses `this` binding on a method. Applies to array methods, lifecycle hooks and event listeners alike — except for the native coercion functions, where `unicorn/prefer-native-coercion-functions` demands the bare reference and is right to: `Number`, `String` and `Boolean` each read one argument and ignore the index, so the wrapper only hides which of the three is being called.
- **Prefer inferred return types** — annotate only when (a) the inferred type is too broad and you want a narrower contract (e.g. `ComputedRef<ValidationRule>` instead of `ComputedRef<(value: string) => string | true>`), or (b) the function is a public API boundary. Never annotate for documentation, service functions included.
- **Don't extract helpers that add no value** — if a helper just wraps an inline object literal or single expression without reuse or meaningful abstraction, use the value directly. Three lines of inline code beats a named wrapper used once.

## Promise Style

- **`try`/`catch` is BANNED** for fallible work — use neverthrow `getResult`/`getResultAsync` (+ `withFinalizer`/`withFinalizerAsync` for cleanup, never `try`/`finally`); never `.catch()` chains. **`new Error(...)` is banned too** — a throw is an `InvalidOperationError`, subject to the one exception `error-handling` names. Both subjects in full, plus `jsonDateParse` for any JSON round trip carrying dates, are the **error-handling** skill's.
- **`.then()`/`.catch()`/`.finally()` are banned** by `no-restricted-syntax`, exceptions included — the shapes that survive it, and what a disable there has to say, are the **error-handling** skill's.
- **Never `await import(...)`** for code-splitting — always a static top-level `import`. The two exceptions, and what a dynamic import that survives them has to say in its comment: `references/dynamic-imports.md`.

- **`void asyncFn()` is banned** (`no-void`) — it silences `no-floating-promises` by discarding the promise, so rejections go unhandled and the caller cannot await completion. The replacement ladder (make the caller `async`, widen the callback to `Promisable<void>`, `getSynchronizedFunction` as the last resort) is `references/floating-promises.md`.

## Control Flow

- **Guard clauses first, one guard per outcome, and a chain runs `if/else if/else` from its first branch to its last** — a balanced `if/else` stays balanced, and no negated test sits before a terminal `else` (`no-negated-condition`). A guard that is one `return` over a fall-through that is one `return` closes with `else`, a formatter wrap included; a fall-through that is a block, or a `return` carrying a body of its own, is the happy path and stays behind the guard, and whether consecutive guards are one chain is read. Writing or reshaping a branch: `references/control-flow.md`.
- **Use `switch` for type-based branching** — branching on an enum/discriminant with multiple cases uses `switch`, not an `if/else if` chain. Use `if/else if/else` only for non-enum expressions or exactly two branches. Never switch over a discriminant purely to dispatch different logic per case — key a map by the discriminant instead (`references/type-modelling.md`).
- **Every `switch` on an enum or discriminated-union discriminant needs `default: exhaustiveGuard(value)`** (or `return exhaustiveGuard(value)` in return-position), imported from `@esposter/shared`, so a new variant is a compile error. Nested switches each need their own guard. **Exception**: switches on non-enum values (strings, numbers, class instances).
- **Use `.includes()` for 2+ equality checks** — `[A, B].includes(x)` not `x === A || x === B`. Extract to a named constant only if reused.

## Loops and Iteration

- **`for...of` with `.entries()` when the index is needed; `Array.from(iterable, mapFn)` over `[...iterable].map(mapFn)`** — `no-restricted-syntax` fails the single-spread shape. When an index-based `for` stays, destructuring in the binding position, and bounding a zip: `references/loops.md`.

## Environment Checks

- **Never `import.meta.dev` or `import.meta.env.MODE` directly** (`no-restricted-syntax`) — `IS_PRODUCTION`/`IS_DEVELOPMENT`/`IS_TEST` from `#shared/util/environment/constants`, the one file that reads them.

## Absent Values

- **`ref<string>()` is BANNED** (`no-restricted-syntax`) — app-owned strings are `string` with `""` as the empty sentinel, checked by truthiness, never `string | undefined`.
- **A property whose absent form is `undefined` is declared `field?: T`, never `field: T | undefined`** (`no-restricted-syntax`), and `undefined` is banned in app-owned code unless it carries a meaning distinct from every real value. `null` is only permitted at the external system boundary (Drizzle, Azure SDK, persisted JSON blobs) — a read that has to tell "still loading" from "loaded, no row" gates on `useQuery`'s `isPending`, never on a `null` third value (`references/absent-values.md`).
- Full sentinel propagation rules, boundary exceptions and the enum-`None` ban: `references/absent-values.md`.
