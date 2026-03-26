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

## Exhaustive Switch Guards

**Every `switch` on an enum or discriminated union discriminant must have a `default: exhaustiveGuard(value)` (or `return exhaustiveGuard(value)` when the switch is in a return-position).** Import `exhaustiveGuard` from `@esposter/shared`. This ensures TypeScript surfaces a compile error when a new enum variant is added without updating the switch.

```ts
// BAD — no default, silently misses new variants
switch (step.type) {
  case MathStepType.Unary: ...
  case MathStepType.Binary: ...
}

// GOOD
switch (step.type) {
  case MathStepType.Unary: ...; break;
  case MathStepType.Binary: ...; break;
  default: exhaustiveGuard(step.type);
}

// GOOD — return-position switch
switch (transformation.part) {
  case DatePartType.Day: return parsedDate.date();
  // ...
  default: return exhaustiveGuard(transformation.part);
}
```

Applies to nested switches too (each inner switch on an enum needs its own guard).

**Exception**: switches on non-enum values (strings, numbers, class instances) do not need an exhaustive guard.

## Enum Naming

- **Never abbreviate enum value names** — use the full word: `Absolute` not `Abs`, `Subtract` not `Sub`, `Configuration` not `Config`. This applies to both the enum key and string value. Abbreviated names save nothing and hurt readability.

## Enum Values Array

- **Never alias `Object.values(Enum)` as a constant** — use `Object.values(MyEnum)` directly at each call site. Never export a constant like `export const MY_FORMATS = Object.values(MyEnum)` just to avoid repeating `Object.values(...)`.

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

**Instead, use a `*ResolveMap` (or `*TypeMap`) where each entry is a resolver function** — receives the typed transformation and a context object:

```ts
// BAD — if/switch chains in one place, hard to extend:
export const resolveValue = (...) => {
  if (transformation.type === ConvertTo) { /* ... */ }
  else if (transformation.type === DatePart) { /* ... */ }
};

// GOOD — per-type compute functions stay co-located with their schema:
// services/column/transformation/computeConvertToTransformation.ts
export const computeConvertToTransformation = (value, t: ConvertToTransformation) => ...;

// services/column/transformation/ColumnTransformationResolveMap.ts
export interface ResolveContext {
  resolveSource: (sourceColumnId: string) => ColumnValue;
  findSource: (sourceColumnId: string) => DataSource["columns"][number] | undefined;
}

type TransformationResolver<T extends ColumnTransformation> = (
  transformation: T,
  context: ResolveContext,
) => ColumnValue;

export const ColumnTransformationResolveMap = {
  [ColumnTransformationType.ConvertTo]: (transformation, { resolveSource }) =>
    computeConvertToTransformation(resolveSource(transformation.sourceColumnId), transformation),

  [ColumnTransformationType.DatePart]: (transformation, { resolveSource, findSource }) => {
    const sourceColumn = findSource(transformation.sourceColumnId);
    if (sourceColumn?.type !== ColumnType.Date) return null;
    // TypeScript narrows sourceColumn to DateColumn via optional chaining + discriminant — sourceColumn.format is accessible
    return computeDatePartTransformation(resolveSource(transformation.sourceColumnId), transformation, sourceColumn.format);
  },
  // ...
} as const satisfies {
  [K in ColumnTransformationType]: TransformationResolver<Extract<ColumnTransformation, { type: K }>>;
};

// Dispatcher builds the context closure and calls the map — one expression:
return ColumnTransformationResolveMap[column.transformation.type](column.transformation as never, { findSource, resolveSource });
```

**Rules:**

- Each per-type compute function lives in `services/<feature>/transformation/compute<TypeName>Transformation.ts`
- The map file (`<Noun>ResolveMap.ts`) imports all per-type functions; each entry is a resolver function
- The `ResolveContext` interface is exported so callers can implement it
- Use `as const satisfies { [K in TheType]: TransformationResolver<Extract<Union, { type: K }>> }` — each resolver entry is typed to its specific transformation subtype
- Call site uses `as never` on the transformation — TypeScript cannot correlate the discriminant key with the map entry's expected parameter type
- TypeScript discriminant narrowing (e.g. `someColumn.type !== ColumnType.Date`) provides type-safe access to subtype fields inside resolvers without explicit casts
- Adding a new variant only requires: (1) a new per-type function file, (2) one new entry in the map

## Opt-In Shared Interfaces for Discriminated Union Members

When some (but not all) members of a discriminated union share a common field, define a shared interface and Zod schema that members **opt into** by extending — never force the field onto all members.

```ts
// shared/models/.../WithSourceColumnId.ts — opt-in base for single-source transformations
export interface WithSourceColumnId { sourceColumnId: string; }
export const withSourceColumnIdSchema = z.object({ sourceColumnId: z.string() });

// shared/models/.../WithSourceColumnIds.ts — opt-in base for multi-source transformations
export interface WithSourceColumnIds { sourceColumnIds: string[]; }
export const withSourceColumnIdsSchema = z.object({ sourceColumnIds: z.array(z.string()).default([]) });

// Each transformation that needs a source column extends the base:
export const convertToTransformationSchema = withSourceColumnIdSchema.extend({
  type: z.literal(ColumnTransformationType.ConvertTo),
  targetType: z.enum([...]),
});

// A transformation needing no source column uses z.object({...}) directly:
export const mathOperationTransformationSchema = z.object({
  first: mathOperandSchema,
  steps: z.array(mathStepSchema).default([]),
  type: z.literal(ColumnTransformationType.MathOperation),
});
```

**Rules:**

- Each shared interface/schema lives in its own file (one export per file rule)
- Members that need the shared field use `.extend()` on the base schema
- Members that don't need it just use `z.object({...})` directly
- Use `WithSourceColumnId` (singular) for single-source, `WithSourceColumnIds` (plural) for multi-source
- Transformations with column type constraints declare `applicableColumnTypes: ColumnType[]` in `.meta()` — used by the UI to filter source column dropdowns. This comes from `GlobalMeta extends Partial<WithApplicableColumnTypes>` in `shared/types/zod.d.ts`
- **`WithApplicableColumnTypes`** — interface in `shared/models/.../WithApplicableColumnTypes.ts` with `readonly applicableColumnTypes: ColumnType[]`. Both Zod `.meta()` (via `GlobalMeta`) and non-schema definitions (e.g. `ColumnStatDefinition`) extend this interface so the same field name is used everywhere:

  ```ts
  // shared/models/.../WithApplicableColumnTypes.ts
  export interface WithApplicableColumnTypes {
    readonly applicableColumnTypes: ColumnType[];
  }

  // app/models/.../ColumnStatDefinition.ts
  export interface ColumnStatDefinition<T extends ColumnStatKey> extends WithApplicableColumnTypes { ... }

  // shared/types/zod.d.ts — makes it optional in schema .meta()
  interface GlobalMeta extends Partial<WithApplicableColumnTypes> { ... }

  // Usage in schema:
  .meta({ applicableColumnTypes: [ColumnType.Date], title: "..." })
  // Usage in stat definition:
  defineColumnStat({ applicableColumnTypes: [ColumnType.Number], ... })
  ```

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
