---
name: typescript
description: Apply when writing any TypeScript in this project. Esposter's TypeScript conventions.
---

# TypeScript Conventions

## Settled — do not re-propose

- **Turning `typescript/consistent-type-imports` on for `.vue`** — oxlint skips the rule there, since it cannot tell from the script block whether the template uses an import as a value. The `.ts` half is on (`disallowTypeAnnotations` off, because `vi.mock(import(…))` is the sanctioned Vitest idiom), and a `.vue` file takes `import type` from vize's `script/consistent-type-imports`, which counts the template's uses.
- **A raw non-printing byte in a literal** — it renders as nothing in a diff, a terminal or an editor, so no reader can tell it from an empty string or its neighbour; the `\uXXXX` escape wins (`scripts/src/workspace/source/controlCharacters.test.ts`, `references/non-printing-characters.md`).
- **Writing the older API a newer one replaces, for compatibility** — the app supports the current release of each browser engine only, and a global one of them lacks is polyfilled rather than avoided (`openspec/specs/architecture/polyfills/design.md`).

## Deep dives

- `references/value-sets.md` — when declaring a closed set of named values, its Zod schema, its values array, or a ref that holds one.
- `references/non-printing-characters.md` — when a non-printing character is about to be written into a literal.
- `references/collections.md` — when mutating an array, reading-or-inserting on a `Map`, choosing a `Set` over `.some()`, or narrowing what a `.filter()` returns.
- `references/type-modelling.md` — when reaching for a cast, re-declaring fields a source/SDK type already has, dispatching per variant, a `NuxtConfig` key the compiler can't see, or a TS2590 the compiler cannot represent.
- `references/control-flow.md` — when writing or reshaping a guard, an `if/else`, or a chain.
- `references/function-signatures.md` — when writing a function's parameters: one-or-many input (two functions, never an overload), nullability a caller narrows, an options object, a default, or a boolean flag.
- `references/floating-promises.md` — when a lint error flags a floating promise, or an async function must be called from a sync slot.
- `references/dynamic-imports.md` — when reaching for `await import(...)`, or a dependency's docs mention `optimizeDeps`.
- `references/class-fields.md` — when adding a field to a class, or building an instance of one.
- `references/loops.md` — when writing a loop: an index-based `for` that stays, binding-position destructuring, bounding a zip.
- `references/cloning.md` — when copying an object or a class instance, deeply or with overrides.
- `references/callbacks.md` — when handing a function to an array method, a hook or a listener.

## Core Rules

- `strict` mode, with oxlint's type-aware rules on (`typeAware` in `oxlint.config.ts`); the banned forms (`any`, `!`, `==`) are the lint rules' own. For `!`, a guard clause or optional chaining beats a cast, and a field with no initializer takes `declare` (`references/class-fields.md`).
- `Omit` → `Except` from `type-fest`, enforced by oxlint `typescript/no-restricted-types`. Import it from `type-fest` directly; it is **not** re-exported from `@esposter/shared`.
- **No parameter properties** — never `constructor(private readonly foo: T)`. Declare fields explicitly and assign in the body.
- **`private` → ECMAScript `#`** (`selector-ban/no-restricted-syntax` in `scripts/src/services/oxlint/selectorBan/syntaxes/scriptRestrictedSyntaxes.ts`). Keep `readonly` when converting (`private readonly foo` → `readonly #foo`); `protected` stays, as `#` is inaccessible to subclasses.
- **Iteration is `for...of`** (`references/loops.md`); `unicorn/no-array-for-each` and `vue/no-restricted-syntax` enforce it.
- `type` aliases for object shapes → `interface` (`consistent-type-definitions`).
- **A type alias is never a second name for a type** — the type is written at each use and the meaning a name carried moves to the type's owner; `selector-ban/no-restricted-syntax` in `scripts/src/services/oxlint/selectorBan/syntaxes/scriptRestrictedSyntaxes.ts` enforces it. A name for a type that has no other name — a `typeof` query (`typeof bansInMessage.$inferSelect`), an indexed access, a generic instantiation — is the type's one name, not a second one, so it stays.
- **The newest platform API, always, and the form it replaces is banned** — every `unicorn/prefer-*` rule not turned off in `oxlint.config.ts` is on repo-wide for that reason, so a legacy form fails lint rather than review; one no rule decides is a finding, and a new replacement earns a `no-restricted-syntax` entry the first time it is re-found.
- **Array methods are non-mutating** — write `toSorted`/`toReversed`/`toSpliced` and assign the result back; the mutating forms are lint errors (`references/collections.md`).
- **Never hand-roll read-or-insert on a `Map`** — `getOrCreate(map, key, () => new Set())` from `@esposter/shared` (`references/collections.md`).
- **Never declare what nothing uses** — every export (schema, type, constant, pluralized values array) earns its existence with a call site; no speculative API. When removing the last consumer of an export, cascade-delete the newly orphaned export and its now-unused imports too. A published package keeps a generic export a consumer may import with no caller in this repository; feature-specific code follows its feature. A feature built from its rules up — its data readers and rule services specced as built, its screen not yet — is judged as one layer: a reader with no caller but the rules it feeds is not dead, and is deleted only with those rules.
- **An unused import or local fails the typecheck (`noUnusedLocals`)**, a `.vue` file's `<script setup>` included, so it is deleted rather than kept for later; `noUnusedParameters` stays off, since a callback names the arguments it is handed.
- **Indexed access under `noUncheckedIndexedAccess`** — `takeOne(array, index)` or `takeOne(record, key)` from `@esposter/shared` drops the `| undefined` the index adds, and a string's character is `str.charAt(index)`, which is `""` out of range. Where a guard reads that absence, the plain index stays, since `takeOne` erases the `undefined` the guard tests for.
- **No `current*` caching of `.value`** just to use it once. If narrowing is needed after a guard, assign a descriptive name (`const selectedFile = file.value`) — `no-restricted-syntax` refuses a `current*` capture. Prefer plain `const` over `computed()` when the source is already non-reactive (e.g. a `readonly` prop field).
- **Cloning plain data is `structuredClone`**; a class instance is rebuilt through its constructor, since neither a clone nor a spread keeps its prototype (`references/cloning.md`).
- **Boolean casting** — never `!!`; always `Boolean(value)`.
- **Interpolation coerces** — `${x}`, never `${x.toString()}`; `no-restricted-syntax` enforces it (a radix `toString(16)` stays). `String(x)` inside a template is only for the types `restrict-template-expressions` rejects (`unknown`, `symbol`).
- **Regex** — a literal for a static pattern, `new RegExp` only when it interpolates, and the `u` flag always (`prefer-regex-literals`, `require-unicode-regexp`). Naming (`_REGEX`) is the `naming` skill's rule ("Constants").
- **Prefer the shortened assignment forms** — compound (`x += y`, `x ??= y`) over `x = x + y`, chained (`a.value = b.value = value`) over repeating the right-hand side. `restrict-plus-operands` and `no-multi-assign` are off for exactly this reason: a cast to silence a lint rule is strictly worse than the operator it replaces.
- **`as unknown as T` is `any` with extra steps** — a `no-restricted-syntax` error in source (`restrictedSourceSyntaxes.ts`; a suite's fakes are exempt), so a surviving one is a disable naming what the compiler cannot see — never "this is safe"; the seams that earn one are `references/type-modelling.md`.
- **A compiler limit (TS2590) is a tagged `@ts-expect-error` in place, not a redesign** (`references/type-modelling.md`).
- **Never `Object.values(SomeSet)` inline**, except a citty command's enum option (`references/value-sets.md`), and never abbreviate a member (`Configuration`, not `Config`).
- **A closed set is an `as const` object with a type of its name** — `export const ThemeMode = { Dark: "dark" } as const;` and `export type ThemeMode = (typeof ThemeMode)[keyof typeof ThemeMode];`, a member in a type position is `typeof ThemeMode.Dark`, and `erasableSyntaxOnly` refuses an `enum` (`references/value-sets.md`).
- **A union of string literals is a value set** — `"delete" | "get"` becomes the set `HttpMethod` in its own model file and the annotation names it, enforced repo-wide by `literal-union/no-string-literal-union` (except in declaration files); the unions that are not sets are `references/value-sets.md`.
- **Track selections by stable ID, not name or index** — names change, indices shift on delete/reorder. Use `entity.id` (UUID) as the key for selected/active items. A stale ID is harmless; a stale name/index is a bug.

## Functions

- **Always arrow functions** — `const fn = () => { ... }`. The `function` keyword is only for cases where `this` binding is required: class methods, object methods referencing `this`, generators (`function*`). Everything else (module-level, composables, callbacks, helpers) must be an arrow function — except a helper that takes a mod's `$` and is imported from a sibling file, which is a `function` declaration (the `claude-mods` skill).
- **A bare function reference handed to an array method is wrapped** — `no-restricted-syntax` in `scripts/src/services/oxlint/selectorBan/syntaxes/restrictedSyntaxes.ts` enforces it; the why, the hooks and listeners, and the `Number`/`String`/`Boolean` exception are `references/callbacks.md`.
- **Prefer inferred return types** — annotate only a narrower contract or a public API boundary (`references/function-signatures.md`).
- **Syntax is never extracted into a helper** — the `over-engineering` skill (`references/syntax-extraction.md`).
- **Use `RegExp.escape(value)` when embedding a string in a regular expression** — do not hand-roll a local `escapeRegExp` helper; `selector-ban/no-restricted-syntax` enforces the named-helper ban in `restrictedSyntaxes.ts`.

## Promise Style

- **`try`, `.then`/`.catch`/`.finally` and `new Error` are banned** — the `error-handling` skill owns all three and their exceptions.
- **Code-splitting is a static top-level `import`**, enforced by `no-restricted-syntax`; the exceptions and their disable comment are `references/dynamic-imports.md`'s.
- **A promise is awaited, never discarded** — `no-void` enforces it, and the replacement ladder (make the caller `async`, widen the callback to `Promisable<void>`, a hook typed `void` kept synchronous, `getSynchronizedFunction` as the last resort) is `references/floating-promises.md`.

## Control Flow

- **Guard clauses first, one guard per outcome, and a chain runs `if/else if/else` from its first branch to its last** — a balanced `if/else` stays balanced, and no negated test sits before a terminal `else` (`no-negated-condition`). Where each shape stops being right: `references/control-flow.md`.
- **`switch` for type-based branching, every one on a value set ending in `default: exhaustiveGuard(value)`**; per-case logic is a map keyed by the discriminant (`references/control-flow.md`).
- **Use `.includes()` for 2+ equality checks** — `[A, B].includes(x)` not `x === A || x === B`. Extract to a named constant only if reused. It does not hold where the subject is a whole `as const` value set and the pair is two of its members: the array infers the pair's own literal union, so a subject of the full set is TS2345 (an enum's pair widens and does hold). Nor does it hold for an optional subject or a null-or-undefined pair, which fail the same way, so those keep `===`.

## Loops and Iteration

- **`for...of` with `.entries()` when the index is needed; `Array.from(iterable, mapFn)` over `[...iterable].map(mapFn)`** — `no-restricted-syntax` fails the single-spread shape. When an index-based `for` stays, destructuring in the binding position, and bounding a zip: `references/loops.md`.

## Environment Checks

- **Build mode is read through `IS_PRODUCTION`/`IS_DEVELOPMENT`**, and a gate that must match what Nuxt strips or serves under `nuxt dev` alone reads `IS_NUXT_DEVELOPMENT`, from `#shared/util/environment/constants`, the one file that reads `import.meta` for either (`no-restricted-syntax`).

## Absent Values

- `""` as the absent string, `?:` over `| undefined` and `null` only at a boundary are the `absent-values` skill's.
