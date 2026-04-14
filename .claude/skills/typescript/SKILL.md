---
name: typescript
description: Esposter TypeScript conventions — banned patterns (any, Omit, !, forEach, parameter properties), error handling with InvalidOperationError, control flow guard clauses, and enum ref defaults. Apply when writing any TypeScript in this project.
---

# TypeScript Conventions

## Core Rules

- **No `With` prefix on mixin interfaces** — name them after the capability they represent: `SourceColumnId`, `SourceColumnIds`, `ApplicableColumnTypes`. Not `WithSourceColumnId`, `WithSourceColumnIds`, `WithApplicableColumnTypes`. The corresponding schema variables drop the `with` prefix too: `sourceColumnIdSchema` not `withSourceColumnIdSchema`.
- **`A` prefix is for abstract classes only** — never use `A` prefix on interfaces. `AColumn` is an abstract class → correct. `ASlashCommand` as an interface → wrong, use `SlashCommand`. If it's an interface, just name it after the concept.
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
- **Only use `new Set` when deduplication is needed** — use `.some()` for unique arrays. `Set` only when: (a) deduplication is the goal, or (b) collection large enough that O(n) `.some()` hurts perf.
- Always use named imports from libraries — only when not already auto-imported by Nuxt or Nuxt modules (e.g. `ref`, `computed`, `watch` from Vue; `storeToRefs` from Pinia; VueUse composables are all auto-imported and must not be manually imported).
- Explicitly type variables with proper types.
- **Never use generic variable names like `parsed`** — always use a descriptive name that includes the type: `parsedDate`, `parsedResult`, `parsedConfig`, etc.
- **Never abbreviate variable names** — use the full descriptive name. `directMessageRoom` not `dmRoom`, `existingDirectMessage` not `existing`, `directMessageParticipantsMap` not `dmParticipantsMap`. Abbreviations that save a few characters at the cost of clarity are banned.
- **No `current*` variable caching of `.value`** — don't assign `const currentX = x.value` just to use it once. If TypeScript narrowing is needed after a guard, assign with a descriptive name (`const selectedFile = file.value`). Prefer plain `const` over `computed()` when the source value is already non-reactive (e.g. a `readonly` prop field).
- **Cloning objects** — use `structuredClone(obj)` for deep clones; use `Object.assign(structuredClone(obj), { ...updates })` to clone and override fields. Never use `{ ...spread }` to clone a class instance — spread creates a plain object losing the prototype. **Exception**: `structuredClone(new ClassName(...))` is intentional when a plain object is explicitly required (e.g. Vjsf does not accept class instances — must use `structuredClone` to strip the prototype). Always add a comment explaining why.
- **Boolean casting** — never use `!!` to cast to boolean. Always use `Boolean(value)`.

## Function Syntax

- **Always use arrow functions** — `const fn = () => { ... }` and `export const fn = () => { ... }`. Never use the `function` keyword except for the narrow cases below.
- **`function` keyword only when `this` binding is required** — class methods, object methods that reference `this`, and generator functions (`function*`). All other functions — module-level, composables, callbacks, helpers — must be arrow functions.

  ```ts
  // WRONG — function declaration for a utility
  export function useInFlight() { ... }
  async function execute<T>(fn: () => Promise<T>) { ... }

  // CORRECT
  export const useInFlight = () => { ... };
  const execute = async <T>(fn: () => Promise<T>): Promise<T | undefined> => { ... };
  ```

## Promise Style

- **Always use `async`/`await`** — never use `.then()` or `.catch()` promise chains. Use `try`/`catch` blocks for error handling.
  - **Exception**: `.then()` is acceptable only for building a **promise queue** (serialising sequential async operations in a sync context, e.g. `chain = chain.then(async () => {...})`). This pattern cannot be expressed with `await` inside a synchronous watcher/event callback. All other `.then()`/`.catch()` usages must be converted.
- When fire-and-forgetting an async operation, extract to a named `async` function and call it without `await`.
- **Never use `void asyncFn()`** — when passing an async function to a sync callback slot (e.g. `onScopeDispose`, event listeners, Phaser callbacks), wrap it with `getSynchronizedFunction(async fn)` from `#shared/util/getSynchronizedFunction` instead. This satisfies `@typescript-eslint/no-misused-promises` without suppressing the lint rule.

## Error Handling

- **Never use `new Error(...)`** — always throw `new InvalidOperationError(operation, name, message)` from `@esposter/shared`.
- Pick the appropriate `Operation` enum value (`Operation.Read`, `Operation.Create`, `Operation.Update`, `Operation.Delete`, etc.).
- Use the resource name (e.g. `file.name`, entity ID) as the `name` argument — fall back to the calling function's name (e.g. `deserializeJson.name`) if no better resource name is available.
- For user-supplied JSON (file uploads, external input): use Zod `safeParse` and throw `InvalidOperationError` on failure — never use bare `JSON.parse` with a type cast.
- For validated endpoint data: `jsonDateParse` from `@esposter/shared` is acceptable.

## Control Flow

- **Guard clauses first**: always use `if (!condition) return` to exit early instead of wrapping the main body in an `if` block. Reduce nesting aggressively — if the body of an `if` is the rest of the function, invert the condition and return early instead.
- **Combine consecutive guards with `||`** — when consecutive early-return guards share the same return value, combine into a single `if`:

  ```ts
  // BAD — two separate guards
  if (!editedItem.value?.dataSource) return;
  if (editedItem.value.dataSource.columns.some(({ name }) => name === newColumn.name)) return;

  // GOOD — combined with ||
  if (!editedItem.value?.dataSource || editedItem.value.dataSource.columns.some(({ name }) => name === newColumn.name))
    return;
  ```

  Exception: when the second check has side effects or depends on the first passing.

- **Use `.includes()` for 2+ equality checks** — `[A, B].includes(x)` not `x === A || x === B`. Extract to named constant only if reused.

- **Use `switch` for type-based branching** — when branching on an enum or discriminant with multiple cases, use `switch` (with `exhaustiveGuard` in the default) instead of a chain of `if/else if`. Use `if/else if/else` only when conditions are non-enum expressions or when there are exactly two branches.
- **Always use `if/else if/else` from the first branch** — no standalone `if` followed by `else if`.

## Return Type Annotations

- **Prefer inferred return types** — don't annotate a function's return type when TypeScript can infer it correctly. Only add explicit return type annotations when: (a) the inferred type is too broad and you want to enforce a narrower contract (e.g. `ComputedRef<ValidationRule>` instead of `ComputedRef<(value: string) => string | true>`), or (b) the function is part of a public API boundary. Never add redundant annotations just for documentation.

## Helper Functions

- **Don't extract helpers that add no value** — if a helper function just wraps an inline object literal or a single expression without reuse or meaningful abstraction, return/use the value directly. Three lines of inline code is better than a named wrapper used once.
- **Function naming prefixes** — use `get*` for functions that derive or compute a display value (e.g. `getVisibilityTooltip`, `getRowTitle`). Use CRUD prefixes (`create*`, `update*`, `delete*`) for heavier operations that interact with data or stores.
- **Boolean-returning functions** — always use `is*` prefix (e.g. `isManageable`, `isExpired`, `isRoomAdmin`). Never `can*` or `should*`. Exception: use `has*` when `is*` reads unnaturally — specifically when checking possession/membership (e.g. `hasPermission`, `hasMember`). The rule in full: prefer `is` → fall back to `has` → never `can`/`should`/`get` for booleans.

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
- **Name interface fields by their full type name** — when an interface field holds a value of an enum type `FooType`, name the field `fooType` (not `foo`, `mode`, `type`, or any abbreviation). Examples: `aggregationType: AggregationTransformationType`, `stringTransformationType: StringTransformationType`, `datePartType: DatePartType`. Never shorten to generic names like `transform`, `mode`, or `value`.

## Enum Extension via mergeObjectsStrict

When a large enum has a meaningful "base" subset that should be handled separately (e.g. a function that only handles some variants), split it:

1. Declare **named sub-groups that are used independently** as exported TypeScript enums in their own files (e.g. `BasicStringTransformationType.ts` — used by functions like `computeStringTransformation` that only handle the base variants).
2. Declare **unlabelled/catch-all values** (e.g. `Interpolate`, future `Split`) as an **unexported `enum BaseXxxType`** inside the merged type's file — never a separate file.
3. Merge using `mergeObjectsStrict` from `@esposter/shared` and export the union type using enum type names.

```ts
// BasicStringTransformationType.ts (exported — sub-functions accept this for exhaustive switch)
export enum BasicStringTransformationType {
  Lowercase = "Lowercase",
  TitleCase = "TitleCase",
  Trim = "Trim",
  Uppercase = "Uppercase",
}
export const basicStringTransformationTypeSchema = z.enum(
  BasicStringTransformationType,
) satisfies z.ZodType<BasicStringTransformationType>;

// StringTransformationType.ts (the merged full type)
enum BaseStringTransformationType {
  // NOT exported — internal only
  Interpolate = "Interpolate",
}
export const StringTransformationType = mergeObjectsStrict(BasicStringTransformationType, BaseStringTransformationType);
export type StringTransformationType = BasicStringTransformationType | BaseStringTransformationType;
export const stringTransformationTypeSchema = z.enum(
  StringTransformationType,
) satisfies z.ZodType<StringTransformationType>;
```

**Why**: Functions like `computeStringTransformation` accept `BasicStringTransformationType` so their `switch` is **exhaustive** — TypeScript verifies all cases are handled and `default: exhaustiveGuard(transform)` is truly unreachable. `mergeObjectsStrict` ensures `StringTransformationType.Lowercase`, `StringTransformationType.Interpolate` etc. all work identically to a plain enum at call sites. Keeping the catch-all `enum BaseXxxType` unexported and co-located in the merged file avoids polluting exports with one-off internal groupings.

## Enum Values Array

- **Export a pluralized `Set` constant from the enum's definition file only when `Object.values` is actually used** — add `export const EnumNames = new Set(Object.values(EnumName))` at the bottom of the file (after the Zod schema, if any). Do not pre-emptively add it if the enum values are never iterated or checked. Use this exported constant at every call site instead of `Object.values(EnumName)`.

  ```ts
  // BooleanFormat.ts
  export const BooleanFormats = new Set(Object.values(BooleanFormat));

  // call sites
  BooleanFormats.has(format); // O(1) lookup
  for (const f of BooleanFormats) { ... } // iteration (Set is iterable)
  Array.from(BooleanFormats, fn); // map over a Set — see below
  ```

- **Never write `Object.values(SomeEnum)` inline** — always use the exported `Set` constant.

## Iterating Non-Array Iterables (Set, Map, etc.)

- **`Array.from(iterable, mapFn)` over `[...iterable].map(mapFn)`** — the two-argument form of `Array.from` maps while converting, producing no intermediate array. Use it whenever mapping over a `Set`, `Map`, or other non-array iterable:

  ```ts
  // CORRECT — Set
  Object.fromEntries(Array.from(VisualTypes, (v) => [v, {}]));

  // CORRECT — Map (iterates as [key, value] pairs directly; no need for .entries())
  Array.from(participantsMap, ([roomId, participants]) => ({ participants, roomId }));

  // WRONG — creates an intermediate array just to map
  Object.fromEntries([...VisualTypes].map((v) => [v, {}]));
  [...participantsMap.entries()].map(([roomId, participants]) => ({ participants, roomId }));
  ```

  The spread + `.map()` pattern is only acceptable when a plain array is already the source.

- **Never use `new Set` just to call `.has()` on a small non-enum array** — if the values are already unique and the array is small, use `.some()` instead. Only `Set` when the source is an enum or the collection is large enough that O(n) repeated lookups would hurt performance.

## Environment Checks

- **Never use `import.meta.dev` or `import.meta.env.MODE`** — always use `useIsProduction()` from `@/composables/useIsProduction`:
  ```ts
  import { useIsProduction } from "@/composables/useIsProduction";
  const isProduction = useIsProduction();
  if (!isProduction) console.warn("...");
  ```
- Call `useIsProduction()` at the top level of the store/composable function (not inside callbacks).

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
// satisfies readonly ColumnStatDefinition[] FAILS (widens T → ColumnStatKey → function parameter too broad)
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

**Instead, use a `*ComputeMap` where each entry is a compute function** — receives the typed transformation and a context object:

```ts
// BAD — if/switch chains in one place, hard to extend:
export const computeValue = (...) => {
  if (transformation.type === ConvertTo) { /* ... */ }
  else if (transformation.type === DatePart) { /* ... */ }
};

// GOOD — per-type compute functions stay co-located with their schema:
// services/column/transformation/computeConvertToTransformation.ts
export const computeConvertToTransformation = (value, t: ConvertToTransformation) => ...;

// services/column/transformation/ColumnTransformationComputeMap.ts
export interface ComputeContext {
  computeSource: (sourceColumnId: string) => ColumnValue;
  findSource: (sourceColumnId: string) => DataSource["columns"][number] | undefined;
}

type TransformationComputer<T extends ColumnTransformation> = (
  transformation: T,
  context: ComputeContext,
) => ColumnValue;

export const ColumnTransformationComputeMap = {
  [ColumnTransformationType.ConvertTo]: (transformation, { computeSource }) =>
    computeConvertToTransformation(computeSource(transformation.sourceColumnId), transformation),

  [ColumnTransformationType.DatePart]: (transformation, { computeSource, findSource }) => {
    const sourceColumn = findSource(transformation.sourceColumnId);
    if (sourceColumn?.type !== ColumnType.Date) return null;
    // TypeScript narrows sourceColumn to DateColumn via optional chaining + discriminant — sourceColumn.format is accessible
    return computeDatePartTransformation(computeSource(transformation.sourceColumnId), transformation, sourceColumn.format);
  },
  // ...
} as const satisfies {
  [K in ColumnTransformationType]: TransformationComputer<Extract<ColumnTransformation, { type: K }>>;
};

// Dispatcher builds the context closure and calls the map — one expression:
return ColumnTransformationComputeMap[column.transformation.type](column.transformation as never, { computeSource, findSource });
```

**Rules:**

- Each per-type compute function lives in `services/<feature>/transformation/compute<TypeName>Transformation.ts`
- The map file (`<Noun>ComputeMap.ts`) imports all per-type functions; each entry is a compute function
- The `ComputeContext` interface is exported so callers can implement it
- Use `as const satisfies { [K in TheType]: TransformationComputer<Extract<Union, { type: K }>> }` — each entry is typed to its specific transformation subtype
- Call site uses `as never` on the transformation — TypeScript cannot correlate the discriminant key with the map entry's expected parameter type
- TypeScript discriminant narrowing (e.g. `someColumn.type !== ColumnType.Date`) provides type-safe access to subtype fields inside computers without explicit casts
- Adding a new variant only requires: (1) a new per-type function file, (2) one new entry in the map

## Opt-In Shared Interfaces for Discriminated Union Members

When some (but not all) members of a discriminated union share a common field, define a shared interface and Zod schema that members **opt into** by extending — never force the field onto all members.

```ts
// shared/models/.../SourceColumnId.ts — opt-in base for single-source transformations
export interface SourceColumnId { sourceColumnId: string; }
export const sourceColumnIdSchema = z.object({ sourceColumnId: z.string() });

// shared/models/.../SourceColumnIds.ts — opt-in base for multi-source transformations
export interface SourceColumnIds { sourceColumnIds: string[]; }
export const sourceColumnIdsSchema = z.object({ sourceColumnIds: z.array(z.string()).default([]) });

// Each transformation that needs a source column spreads the base schema's .shape:
export const convertToTransformationSchema = z.object({
  ...sourceColumnIdSchema.shape,
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
- No `With` prefix on mixin interface names — `SourceColumnId` not `WithSourceColumnId`; schema variables follow: `sourceColumnIdSchema` not `withSourceColumnIdSchema`
- Members spread `.shape` from the base schema (never `.extend()`) — see zod skill
- Members that don't need the shared field just use `z.object({...})` directly
- Use `SourceColumnId` (singular) for single-source, `SourceColumnIds` (plural) for multi-source
- Transformations with column type constraints declare `applicableColumnTypes: ColumnType[]` in `.meta()` — used by the UI to filter source column dropdowns. This comes from `GlobalMeta extends Partial<ApplicableColumnTypes>` in `shared/types/zod.d.ts`
- **`ApplicableColumnTypes`** — interface in `shared/models/.../ApplicableColumnTypes.ts` with `readonly applicableColumnTypes: ColumnType[]`. Both Zod `.meta()` (via `GlobalMeta`) and non-schema definitions (e.g. `ColumnStatDefinition`) extend this interface so the same field name is used everywhere:

  ```ts
  // shared/models/.../ApplicableColumnTypes.ts
  export interface ApplicableColumnTypes {
    readonly applicableColumnTypes: ColumnType[];
  }

  // app/models/.../ColumnStatDefinition.ts
  export interface ColumnStatDefinition<T extends ColumnStatKey> extends ApplicableColumnTypes { ... }

  // shared/types/zod.d.ts — makes it optional in schema .meta()
  interface GlobalMeta extends Partial<ApplicableColumnTypes> { ... }

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
