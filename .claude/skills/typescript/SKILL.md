---
name: typescript
description: Esposter TypeScript conventions — banned patterns (any, Omit, !, forEach, parameter properties), error handling with InvalidOperationError, control flow guard clauses, and enum ref defaults. Apply when writing any TypeScript in this project.
---

# TypeScript Conventions

## Core Rules

- TypeScript compiler: `strict` mode enabled. ESLint: `tseslint.configs.strictTypeChecked`. `any` is **BANNED**.
- **Always use strict equality** — `===` and `!==` only. Never `==` or `!=`, including null checks: use `=== null || === undefined` (or optional chaining) instead of `== null`.
- `Omit` is **BANNED** — use `Except` from `type-fest` (`import type { Except } from "type-fest"`). Note: `Except` is not re-exported from `@esposter/shared` — always import directly from `type-fest`.
- **No parameter properties** — never use `constructor(private readonly foo: T)`. Always declare class properties explicitly and assign in the constructor body: `private readonly foo: T; constructor(foo: T) { super(); this.foo = foo; }`.
- Non-null assertions (`!`) are **BANNED** — use optional chaining or guard clauses.
- `.forEach()` is **BANNED** — use `for...of`.
- `type` aliases for object shapes are **BANNED** — always use `interface` for object type declarations.
- **Always prefer non-mutating array methods** — use the copy versions that return a new array instead of mutating in place:
  - `arr.toSorted(fn)` instead of `[...arr].sort(fn)` — `sort()` is **BANNED**
  - `arr.toReversed()` instead of `[...arr].reverse()` — `reverse()` is **BANNED**
  - `arr.toSpliced(start, deleteCount, ...items)` instead of manual splice + spread — `splice()` is **BANNED** for producing new arrays (it is still allowed for in-place mutation of store/reactive arrays)
  - `arr.with(index, value)` instead of `[...arr.slice(0, i), value, ...arr.slice(i + 1)]`
- **Only use `new Set` when deduplication is actually needed** — do not wrap an array in `Set` just to call `.has()` if the values are already unique. Use `.some()` instead: `arr.some(({ id }) => id === targetId)`. Only reach for `Set` when: (a) the source array may contain duplicates and deduplication is the goal, or (b) the collection is large enough that repeated O(n) `.some()` calls would materially hurt performance.
- Always use named imports from libraries — only when not already auto-imported by Nuxt or Nuxt modules (e.g. `ref`, `computed`, `watch` from Vue; `storeToRefs` from Pinia; VueUse composables are all auto-imported and must not be manually imported).
- Explicitly type variables with proper types.
- **No `current*` variable caching of `.value`** — don't assign `const currentX = x.value` just to use it once. If TypeScript narrowing is needed after a guard, assign with a descriptive name (`const selectedFile = file.value`). Prefer plain `const` over `computed()` when the source value is already non-reactive (e.g. a `readonly` prop field).
- **Cloning objects** — use `structuredClone(obj)` for deep clones; use `Object.assign(structuredClone(obj), { ...updates })` to clone and override fields. Never use `{ ...spread }` to clone a class instance — spread creates a plain object losing the prototype. **Exception**: `structuredClone(new ClassName(...))` is intentional when a plain object is explicitly required (e.g. Vjsf does not accept class instances — must use `structuredClone` to strip the prototype). Always add a comment explaining why.
- **Boolean casting** — never use `!!` to cast to boolean. Always use `Boolean(value)`.

## Promise Style

- **Always use `async`/`await`** — never use `.then()` or `.catch()` promise chains. Use `try`/`catch` blocks for error handling.
- When fire-and-forgetting an async operation, extract to a named `async` function and call it without `await`.

## Error Handling

- **Never use `new Error(...)`** — always throw `new InvalidOperationError(operation, name, message)` from `@esposter/shared`.
- Pick the appropriate `Operation` enum value (`Operation.Read`, `Operation.Create`, `Operation.Update`, `Operation.Delete`, etc.).
- Use the resource name (e.g. `file.name`, entity ID) as the `name` argument — fall back to the calling function's name (e.g. `deserializeJson.name`) if no better resource name is available.
- For user-supplied JSON (file uploads, external input): use Zod `safeParse` and throw `InvalidOperationError` on failure — never use bare `JSON.parse` with a type cast.
- For validated endpoint data: `jsonDateParse` from `@esposter/shared` is acceptable.

## Control Flow

- **Guard clauses first**: always use `if (!condition) return` to exit early instead of wrapping the main body in an `if` block. Reduce nesting aggressively — if the body of an `if` is the rest of the function, invert the condition and return early instead.
- **Always use `if/else if/else` from the very first branch** when a function has multiple conditional returns — no standalone `if` followed by `else if`.

## Return Type Annotations

- **Prefer inferred return types** — don't annotate a function's return type when TypeScript can infer it correctly. Only add explicit return type annotations when: (a) the inferred type is too broad and you want to enforce a narrower contract (e.g. `ComputedRef<ValidationRule>` instead of `ComputedRef<(value: string) => string | true>`), or (b) the function is part of a public API boundary. Never add redundant annotations just for documentation.

## Helper Functions

- **Don't extract helpers that add no value** — if a helper function just wraps an inline object literal or a single expression without reuse or meaningful abstraction, return/use the value directly. Three lines of inline code is better than a named wrapper used once.
- **Function naming prefixes** — use `get*` for functions that derive or compute a display value (e.g. `getVisibilityTooltip`, `getRowTitle`). Use CRUD prefixes (`create*`, `update*`, `delete*`) for heavier operations that interact with data or stores.

## Enum Refs

- **Never use `ref<EnumType | null>(null)`** — always default to a sensible first enum value: `ref(DataSourceType.Csv)`, `ref(ColumnType.String)`, etc.
- **Never write `ref<EnumType>(EnumValue)`** — TypeScript infers the enum type from the value. Write `ref(ColumnType.String)`, not `ref<ColumnType>(ColumnType.String)`.

## Stable Identifiers for Selections

- **Track selections by stable ID, not by name or index** — column names change, indices shift on delete/reorder. Always use `entity.id` (UUID) as the key when storing which items are selected/active. A stale ID in a selection is harmless; a stale name or index is a bug.

## Generic Definition Arrays — `as const` Without `satisfies`

When a definition array has entries typed as `Definition<T>` where the generic `T` controls a **contravariant** position (e.g. a callback parameter like `format: (value: ColumnStats[T]) => string`), using `satisfies readonly Definition[]` widens each entry to `Definition<KeyUnion>`, which fails due to contravariance.

**Fix**: drop `satisfies` and use `as const` alone. Each entry retains its specific `Definition<"specificKey">` type, inferred by the `define*` helper.

```ts
// ColumnStatDefinition<T> has format: (value: ColumnStats[T]) => string  — contravariant in T
// satisfies readonly ColumnStatDefinition[] FAILS (widens T → ColumnStatKey → function param too broad)
// as const alone PASSES — preserves ColumnStatDefinition<"nullCount">, etc.
export const ColumnStatDefinitions = [
  defineColumnStat({ key: "nullCount", format: (value) => String(value), ... }),
  ...
] as const;  // NOT "satisfies readonly ColumnStatDefinition[]"
```

At call sites where the entry is destructured from the array (losing key↔format correlation), cast the value with `as never`:

```ts
// key and format are destructured — TypeScript loses their correlation
format(item[key] as never); // safe: key and format always come from the same definition entry
```

## Filter-Based Type Narrowing

- **No redundant type guards after a filtering condition** — if a `.filter()` predicate already narrows the type (e.g. `filter((v) => typeof v === "number")`), the resulting array is already typed `number[]`. Do NOT add a separate type guard (`: v is number`) or cast inside the callback — the filter itself is sufficient.
  ```ts
  // WRONG — redundant guard
  values.filter((v): v is number => typeof v === "number");
  // CORRECT — filter condition narrows the type
  values.filter((v) => typeof v === "number");
  ```
  Exception: when the predicate is a function reference (e.g. `filter(Boolean)`) that TypeScript cannot narrow automatically, a type predicate is still needed.

## Polymorphic Dispatch — No Switch Statements

**NEVER** write a function that switches over a discriminant enum to call different logic for each case. This anti-pattern (a "type switch dispatcher") concentrates all variant logic in one place, prevents co-location, and forces every new variant to touch the central function.

**Instead, use a `*TypeComputeMap` (or `*TypeMap`) with a `compute` property per entry** — mirroring the `compute` property used in `ColumnStatDefinitions`:

```ts
// BAD — all logic in one place, hard to extend:
const computeColumnTransformation = (value, transformation) => {
  switch (transformation.type) {
    case ColumnTransformationType.ConvertTo: /* ... big block ... */
    case ColumnTransformationType.DatePart: /* ... big block ... */
  }
};

// GOOD — each type's logic lives co-located with its own type definition:
// services/column/transformation/computeConvertToTransformation.ts
export const computeConvertToTransformation = (value, t: ConvertToTransformation) => ...;

// services/column/transformation/ColumnTransformationTypeComputeMap.ts
export const ColumnTransformationTypeComputeMap = {
  [ColumnTransformationType.ConvertTo]: { compute: computeConvertToTransformation },
  [ColumnTransformationType.DatePart]:  { compute: computeDatePartTransformation },
  ...
} as const;

// Dispatcher is now a one-liner:
export const computeColumnTransformation = (value, transformation) =>
  ColumnTransformationTypeComputeMap[transformation.type].compute(value, transformation as never);
```

**Rules:**

- Each per-type function lives in `services/<feature>/transformation/compute<TypeName>Transformation.ts`, co-located with its schema
- The map file (`<Noun>TypeComputeMap.ts`) imports all per-type functions and re-exports as entries
- Use `as const satisfies Record<TheType, { compute: (value: TValue, transformation: never) => TResult }>` — `never` as the parameter type satisfies contravariance (every specific function accepts something ≥ `never`); cast at the call site with `as never`
- Adding a new variant only requires: (1) a new per-type function file, (2) one new entry in the map

## Opt-In Shared Interfaces for Discriminated Union Members

When some (but not all) members of a discriminated union share a common field, define a shared interface and Zod schema that members **opt into** by extending — never force the field onto all members.

```ts
// shared/models/.../WithSourceColumn.ts — opt-in base
export interface WithSourceColumn { sourceColumnId: string; }
export const withSourceColumnSchema = z.object({ sourceColumnId: z.string() });

// Each transformation that needs a source column extends the base:
export const convertToTransformationSchema = withSourceColumnSchema.extend({
  type: z.literal(ColumnTransformationType.ConvertTo),
  targetType: z.enum([...]),
});

// A future static transformation that needs NO source column simply doesn't extend it:
export const staticValueTransformationSchema = z.object({
  type: z.literal(ColumnTransformationType.StaticValue),
  value: z.string(),
});
```

**Rules:**

- The shared interface/schema lives in its own file (one export per file rule)
- Members that need the shared field use `.extend()` on the base schema
- Members that don't need it just use `z.object({...})` directly
- This pattern scales to multiple shared interfaces (e.g. `WithSourceColumns` for multi-input transformations)

## Configuration Interfaces — `Pick` from Source Types

When a configuration interface re-declares properties that already exist on a source type (e.g. a Phaser `GameObjects.X`), use `Pick<SourceType, "prop1" | "prop2">` in the `extends` clause instead of re-declaring each property individually.

```ts
// BAD — re-declares types that already exist on GameObjects.Arc
export interface ArcConfiguration extends ShapeConfiguration {
  closePath: GameObjects.Arc["closePath"];
  endAngle: GameObjects.Arc["endAngle"];
  radius: GameObjects.Arc["radius"];
  startAngle: GameObjects.Arc["startAngle"];
}

// GOOD — Pick directly from the source type
export interface ArcConfiguration
  extends ShapeConfiguration, Pick<GameObjects.Arc, "closePath" | "endAngle" | "radius" | "startAngle"> {}
```

Use `Pick` for all properties whose types are derived directly from the source type. Keep explicit property declarations only for:

- `Parameters<SourceType["method"]>` tuples — no readable property to pick
- `Parameters<SourceType["method"]>[n]` — same
- Plain primitives (`number`, `string`) representing constructor arguments with no matching readable property on the source type
