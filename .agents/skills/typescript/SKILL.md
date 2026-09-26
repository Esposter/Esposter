---
name: typescript
description: Apply when writing any TypeScript in this project. Esposter TypeScript conventions — the banned patterns and what replaces each, functions and callbacks, promise style, control flow, loops, absent values, enums, and modelling a type instead of casting.
---

# TypeScript Conventions

## Settled — do not re-propose

- **Turning `typescript/consistent-type-imports` on for `.vue`** — oxlint skips the rule there, since it cannot tell from the script block whether the template uses an import as a value, and nothing in the ESLint config reaches it; the `.ts` half is on (`disallowTypeAnnotations` off, because `vi.mock(import(…))` is the sanctioned Vitest idiom), so a class used only in type position takes `import type` by lint, and a `.vue` file keeps it by reading.
- **Writing the older API a newer one replaces, for compatibility** — the app supports the current release of each browser engine only, and a global one of them lacks is polyfilled rather than avoided (`apps/web/content/docs/architecture/polyfills.md`).

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
- `references/cloning.md` — when copying an object or a class instance, deeply or with overrides.
- `references/callbacks.md` — when handing a function to an array method, a hook or a listener.

## Core Rules

- `strict` mode, with oxlint's type-aware rules on (`typeAware` in `oxlint.config.ts`). `any`, non-null assertions (`!`), and `==`/`!=` are lint errors (`no-explicit-any`, `no-non-null-assertion`, `eqeqeq`) — for `!` prefer a guard clause or optional chaining over a cast, and a field with no initializer takes `declare` rather than `!` (`references/class-fields.md`).
- `Omit` → `Except` from `type-fest`, enforced by oxlint `typescript/no-restricted-types`. Import it from `type-fest` directly; it is **not** re-exported from `@esposter/shared`.
- **No parameter properties** — never `constructor(private readonly foo: T)`. Declare fields explicitly and assign in the body.
- **`private` → ECMAScript `#`** (`no-restricted-syntax` in `packages/configuration/eslint/typescriptRules.js`). Keep `readonly` when converting (`private readonly foo` → `readonly #foo`); `protected` stays, as `#` is inaccessible to subclasses.
- `.forEach()` is **BANNED** — use `for...of` (`references/loops.md`); `unicorn/no-array-for-each` enforces it in script, `vue/no-restricted-syntax` in templates.
- `type` aliases for object shapes → `interface` (`consistent-type-definitions`).
- **The newest platform API, always, and the form it replaces is banned** — every `unicorn/prefer-*` rule is on repo-wide for that reason, so a legacy form fails lint rather than review; one no rule decides is a finding, and a new replacement earns a `no-restricted-syntax` entry the first time it is re-found.
- **Non-mutating array methods, enforced** — `sort()`, `reverse()` and `splice()` are lint errors; write `toSorted`/`toReversed`/`toSpliced` and assign the result back (`references/collections.md`).
- **Never hand-roll read-or-insert on a `Map`** — `getOrCreate(map, key, () => new Set())` from `@esposter/shared` (`references/collections.md`).
- **Never declare what nothing uses** — every export (schema, type, constant, pluralized enum array) earns its existence with a call site; no speculative API. When removing the last consumer of an export, cascade-delete the newly orphaned export and its now-unused imports too.
- **No `current*` caching of `.value`** just to use it once. If narrowing is needed after a guard, assign a descriptive name (`const selectedFile = file.value`). Prefer plain `const` over `computed()` when the source is already non-reactive (e.g. a `readonly` prop field).
- **Cloning plain data is `structuredClone`**; a class instance is rebuilt through its constructor, since neither a clone nor a spread keeps its prototype (`references/cloning.md`).
- **Boolean casting** — never `!!`; always `Boolean(value)`.
- **Interpolation coerces** — `${x}`, never `${x.toString()}`; `no-restricted-syntax` enforces it (a radix `toString(16)` stays). `String(x)` inside a template is only for the types `restrict-template-expressions` rejects (`unknown`, `symbol`).
- **Regex** — literals for static patterns, `new RegExp(template, flags)` only when the pattern interpolates, and always the `u` flag; all three are lint errors otherwise (`prefer-regex-literals`, `require-unicode-regexp`). Naming (`_REGEX`) is the `naming` skill's rule.
- **A non-printing character is written as its `\uXXXX` escape, never the raw byte** (`scripts/src/workspace/controlCharacters.test.ts`, `references/absent-values.md`).
- **Prefer the shortened assignment forms** — compound (`x += y`, `x ??= y`) over `x = x + y`, chained (`a.value = b.value = value`) over repeating the right-hand side. `restrict-plus-operands` and `no-multi-assign` are off for exactly this reason: a cast to silence a lint rule is strictly worse than the operator it replaces.
- **`as unknown as T` is `any` with extra steps** — a `no-restricted-syntax` error in source (`restrictedSourceSyntaxes.js`; a suite's fakes are exempt), so a surviving one is a disable naming what the compiler cannot see — never "this is safe"; the seams that earn one are `references/type-modelling.md`.
- **A compiler limit (TS2590) is a tagged `@ts-expect-error` in place, not a redesign** (`references/type-modelling.md`).
- **Never `Object.values(SomeEnum)` inline**, and never abbreviate an enum value name (`Configuration`, not `Config`).
- **A union of string literals is an enum** — `"delete" | "get"` becomes `enum HttpMethod` in its own model file and the annotation names it, enforced repo-wide by `literal-union/no-string-literal-union`. The unions that are not sets, and what a genuine disable has to say: `references/enums.md`.
- **Track selections by stable ID, not name or index** — names change, indices shift on delete/reorder. Use `entity.id` (UUID) as the key for selected/active items. A stale ID is harmless; a stale name/index is a bug.

## Functions

- **Always arrow functions** — `const fn = () => { ... }`. The `function` keyword is only for cases where `this` binding is required: class methods, object methods referencing `this`, generators (`function*`). Everything else (module-level, composables, callbacks, helpers) must be an arrow function.
- **Never pass a function reference as a callback** — wrap it, `array.map((item) => fn(item))`, except `Number`, `String` and `Boolean` (`references/callbacks.md`).
- **Prefer inferred return types** — annotate only a narrower contract or a public API boundary (`references/function-signatures.md`).
- **Syntax is never extracted into a helper** — the `file-organization` skill.

## Promise Style

- **`try`, `.then`/`.catch`/`.finally` and `new Error` are banned** — the `error-handling` skill owns all three and their exceptions.
- **Never `await import(...)`** for code-splitting — always a static top-level `import`. The two exceptions, and what a dynamic import that survives them has to say in its comment: `references/dynamic-imports.md`.
- **`void asyncFn()` is banned** (`no-void`) — it silences `no-floating-promises` by discarding the promise, so rejections go unhandled and the caller cannot await completion. The replacement ladder (make the caller `async`, widen the callback to `Promisable<void>`, `getSynchronizedFunction` as the last resort) is `references/floating-promises.md`.

## Control Flow

- **Guard clauses first, one guard per outcome, and a chain runs `if/else if/else` from its first branch to its last** — a balanced `if/else` stays balanced, and no negated test sits before a terminal `else` (`no-negated-condition`). A guard that is one `return` over a fall-through that is one `return` closes with `else`, a formatter wrap included; a fall-through that is a block, or a `return` carrying a body of its own, is the happy path and stays behind the guard, and whether consecutive guards are one chain is read. Writing or reshaping a branch: `references/control-flow.md`.
- **`switch` for type-based branching, every one on an enum ending in `default: exhaustiveGuard(value)`**; per-case logic is a map keyed by the discriminant (`references/control-flow.md`).
- **Use `.includes()` for 2+ equality checks** — `[A, B].includes(x)` not `x === A || x === B`. Extract to a named constant only if reused.

## Loops and Iteration

- **`for...of` with `.entries()` when the index is needed; `Array.from(iterable, mapFn)` over `[...iterable].map(mapFn)`** — `no-restricted-syntax` fails the single-spread shape. When an index-based `for` stays, destructuring in the binding position, and bounding a zip: `references/loops.md`.

## Environment Checks

- **Never `import.meta.dev` or `import.meta.env.MODE` directly** (`no-restricted-syntax`) — `IS_PRODUCTION`/`IS_DEVELOPMENT`/`IS_TEST` from `#shared/util/environment/constants`, the one file that reads them.

## Absent Values

- **`ref<string>()` is BANNED** (`no-restricted-syntax`) — app-owned strings are `string` with `""` as the empty sentinel, checked by truthiness, never `string | undefined`.
- **An absent property is `field?: T`, never `field: T | undefined`**, and `null` only at an external boundary (`references/absent-values.md`).
- Full sentinel propagation rules, boundary exceptions and the enum-`None` ban: `references/absent-values.md`.
