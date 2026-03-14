---
name: typescript
description: Esposter TypeScript conventions — banned patterns (any, Omit, !, forEach, parameter properties), error handling with InvalidOperationError, control flow guard clauses, and enum ref defaults. Apply when writing any TypeScript in this project.
---

# TypeScript Conventions

## Core Rules

- TypeScript compiler: `strict` mode enabled. ESLint: `tseslint.configs.strictTypeChecked`. `any` is **BANNED**.
- `Omit` is **BANNED** — use `Except` from `type-fest`.
- **No parameter properties** — never use `constructor(private readonly foo: T)`. Always declare class properties explicitly and assign in the constructor body: `private readonly foo: T; constructor(foo: T) { super(); this.foo = foo; }`.
- Non-null assertions (`!`) are **BANNED** — use optional chaining or guard clauses.
- `.forEach()` is **BANNED** — use `for...of`.
- Always use named imports from libraries — only when not already auto-imported by Nuxt or Nuxt modules (e.g. `ref`, `computed`, `watch` from Vue; `storeToRefs` from Pinia; VueUse composables are all auto-imported and must not be manually imported).
- Explicitly type variables with proper types.
- **No `current*` variable caching of `.value`** — don't assign `const currentX = x.value` just to use it once. If TypeScript narrowing is needed after a guard, assign with a descriptive name (`const selectedFile = file.value`). Prefer plain `const` over `computed()` when the source value is already non-reactive (e.g. a `readonly` prop field).
- **Cloning objects** — use `structuredClone(obj)` for deep clones; use `Object.assign(structuredClone(obj), { ...updates })` to clone and override fields. Never use `{ ...spread }` to clone a class instance — spread creates a plain object losing the prototype.
- **Boolean casting** — never use `!!` to cast to boolean. Always use `Boolean(value)`.

## Error Handling

- **Never use `new Error(...)`** — always throw `new InvalidOperationError(operation, name, message)` from `@esposter/shared`.
- Pick the appropriate `Operation` enum value (`Operation.Read`, `Operation.Create`, `Operation.Update`, `Operation.Delete`, etc.).
- Use the resource name (e.g. `file.name`, entity ID) as the `name` argument — fall back to the calling function's name (e.g. `deserializeJson.name`) if no better resource name is available.
- For user-supplied JSON (file uploads, external input): use Zod `safeParse` and throw `InvalidOperationError` on failure — never use bare `JSON.parse` with a type cast.
- For validated endpoint data: `jsonDateParse` from `@esposter/shared` is acceptable.

## Control Flow

- **Guard clauses first**: always use `if (!condition) return` to exit early instead of wrapping the main body in an `if` block. Reduce nesting aggressively — if the body of an `if` is the rest of the function, invert the condition and return early instead.
- **Always use `if/else if/else` from the very first branch** when a function has multiple conditional returns — no standalone `if` followed by `else if`.

## Helper Functions

- **Don't extract helpers that add no value** — if a helper function just wraps an inline object literal or a single expression without reuse or meaningful abstraction, return/use the value directly. Three lines of inline code is better than a named wrapper used once.

## Enum Refs

- **Never use `ref<EnumType | null>(null)`** — always default to a sensible first enum value: `ref(DataSourceType.Csv)`, `ref(ColumnType.String)`, etc.

## Stable Identifiers for Selections

- **Track selections by stable ID, not by name or index** — column names change, indices shift on delete/reorder. Always use `entity.id` (UUID) as the key when storing which items are selected/active. A stale ID in a selection is harmless; a stale name or index is a bug.
