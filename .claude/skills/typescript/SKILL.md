---
name: typescript
description: Esposter TypeScript conventions — banned patterns (any, Omit, !, forEach, parameter properties), error handling with InvalidOperationError, control flow guard clauses, and enum ref defaults. Apply when writing any TypeScript in this project.
---

# TypeScript Conventions

## Core Rules

- `strict` mode + `tseslint.configs.strictTypeChecked`. `any` is **BANNED**.
- **Strict equality only** — `===`/`!==`, never `==`/`!=`. For null checks use `=== null || === undefined` (or optional chaining), never `== null`.
- `Omit` is **BANNED** — use `Except` from `type-fest` (import directly; not re-exported from `@esposter/shared`).
- **No parameter properties** — never `constructor(private readonly foo: T)`. Declare fields explicitly and assign in the body.
- **The `private` keyword is BANNED** — use ECMAScript `#` private members instead (see Private Members). `protected` is still allowed (no `#` equivalent for subclass access).
- Non-null assertions (`!`) are **BANNED** — both the expression operator (`foo!.bar`) and the field definite-assignment assertion (`field!: T`, see Class Fields). Use optional chaining or guard clauses.
- `.forEach()` is **BANNED** — use `for...of`.
- `type` aliases for object shapes are **BANNED** — use `interface`.
- **Prefer non-mutating array methods** (copy versions returning a new array):
  - `arr.toSorted(fn)` not `[...arr].sort(fn)` — `sort()` **BANNED**
  - `arr.toReversed()` not `[...arr].reverse()` — `reverse()` **BANNED**
  - `arr.toSpliced(...)` not manual splice+spread — `splice()` **BANNED** for producing new arrays (still allowed for in-place mutation of store/reactive arrays)
  - `arr.with(index, value)` not `[...arr.slice(0, i), value, ...arr.slice(i + 1)]`
- **`new Set` only for dedup** — use `.some()` for unique arrays. `Set` only when (a) deduplication is the goal, or (b) collection large enough that O(n) `.some()` hurts perf.
- Named imports from libraries, but only when not auto-imported by Nuxt/modules (`ref`, `computed`, `watch` from Vue; `storeToRefs` from Pinia; all VueUse composables are auto-imported — never import manually).
- **Use the `node:` protocol for Node.js built-ins** — `import { readFileSync } from "node:fs"`, never bare `"fs"`/`"path"`/`"crypto"`. Enforced by `unicorn/prefer-node-protocol`.
- Explicitly type variables with proper types.
- **Never generic variable names like `parsed`** — use a name including the type: `parsedDate`, `parsedResult`.
- **No `current*` caching of `.value`** just to use it once. If narrowing is needed after a guard, assign a descriptive name (`const selectedFile = file.value`). Prefer plain `const` over `computed()` when the source is already non-reactive (e.g. a `readonly` prop field).
- **Cloning** — `structuredClone(obj)` for deep clones; `Object.assign(structuredClone(obj), { ...updates })` to clone+override. Never `{ ...spread }` to clone a class instance (loses prototype). **Exception**: `structuredClone(new ClassName(...))` when a plain object is explicitly required (e.g. Vjsf rejects class instances) — add a comment explaining why.
- **Boolean casting** — never `!!`; always `Boolean(value)`.

## Class Fields — `declare` over `!`

For a class field with **no inline initializer** (value provided by `Object.assign(this, init)`, a parent/mixin constructor, external assignment, or a pure phantom type carrier), use `declare`, **never** `!`.

```ts
export class FileEntity {
  declare filename: string; // value comes from Object.assign below
  constructor(init?: Partial<FileEntity>) {
    Object.assign(this, init);
  }
}
```

**Why**: `declare` emits no field declaration, avoiding the `useDefineForClassFields` footgun where an emitted `field = undefined` runs after `super()` and clobbers a value set by a parent/mixin. `!` only suppresses the strict-init error while still emitting the clobbering initializer.

- Applies to all fields lacking an inline initializer: phantom type carriers, `Object.assign`-populated entity models (`AzureEntity`/`CompositeKeyEntity`/`*MessageEntity`), externally-assigned fields.
- **Keep the inline initializer** for fields that have one (`id: string = crypto.randomUUID()`) — never convert to `declare` (drops the runtime default); they're mutually exclusive.
- Optional fields (`direction?: Direction`) are already correct — leave them.

## Private Members — `#` over `private`

Class-private fields and methods use the ECMAScript `#` prefix, never the TypeScript `private` keyword. `#` gives true runtime privacy (not just compile-time); `private` is erased at runtime.

```ts
export class MoveColumnCommand {
  readonly #fromIndex: number;
  #moveColumn(item: DataSourceItem) {
    columns.splice(this.#fromIndex, 1);
  }
}
```

- `private readonly foo: T` → `readonly #foo: T` — **keep `readonly`**; it is allowed on `#` fields and still enforces immutability.
- `private foo()` → `#foo()`; `private async *foo()` → `async *#foo()`.
- Access is always `this.#foo` — there is no `this.foo` form for `#` members.
- **`protected` stays** — `#` is inaccessible to subclasses, so members a subclass must reach (e.g. `protected doExecute`) keep `protected`.

## Regex

- **Regex literals** `/pattern/flags` for static patterns (`prefer-regex-literals`).
- **Always include the `u` flag** — `/pattern/u`, `/pattern/gu`, `/pattern/gmu`.
- **Dynamic patterns only**: `new RegExp(template, flags)` when the pattern contains interpolation — `new RegExp(\`\\b${escaped}\\s\*\\(\`, "u")`.
- **Named constants use `_REGEX` suffix** — `EMPTY_TEXT_REGEX`. Never `_RE`/`_PATTERN`.

## Function Syntax

- **Always arrow functions** — `const fn = () => { ... }`. Never the `function` keyword except below.
- **`function` keyword only when `this` binding is required** — class methods, object methods referencing `this`, generators (`function*`). Everything else (module-level, composables, callbacks, helpers) must be arrow functions.

## Arrow Function Overloads

Use call signature syntax on the variable type — never `function` declarations for overloads:

```ts
interface GetPermissions {
  (db: Db, userId: string, roomId: string): Promise<bigint>;
  (db: Db, userId: string, roomIds: string[]): Promise<Map<string, bigint>>;
}

export const getPermissions: GetPermissions = async (db, userId, roomIds: string | string[]) => {
  const roomIdArray = Array.isArray(roomIds) ? roomIds : [roomIds];
  // ...shared implementation...
  if (Array.isArray(roomIds)) return result; // Map branch
  return result.get(roomIds) ?? fallback; // scalar branch
};
```

- Overload signatures go on the `const`'s **type annotation**, not repeated in the body.
- Implementation parameter types must be the **union** of all overload variants.
- Use `Array.isArray` to branch; each branch returns its specific type.

## Promise Style

- **`async`/`await` with neverthrow for fallible work** — `try`/`catch` is **BANNED**; never `.catch()` chains. Use `getResult(() => ...)` for sync throwing ops and `getResultAsync(() => ...)` for async/rejecting ops. Do not call `fromThrowable`/`ResultAsync.fromPromise`/`ResultAsync.fromThrowable` directly. For cleanup after both success and failure use `withFinalizer(...)`/`withFinalizerAsync(...)` — never `try`/`finally`.
- **`.then()` exception**: acceptable only for a **promise queue** (serialising sequential async ops in a sync context, e.g. `chain = chain.then(async () => {...})`) — can't be expressed with `await` in a sync watcher/callback. All other `.then()`/`.catch()` must be converted.
- Every `Result`/`ResultAsync` must be consumed with `.match(...)`, `.unwrapOr(...)`, or `._unsafeUnwrap()`; `.orTee(...)` alone is not enough.
- Fire-and-forget: extract to a named `async` function and call without `await`.
- **Never `void asyncFn()`** — when passing an async function to a sync callback slot (`onScopeDispose`, event listeners, Phaser callbacks), wrap with `getSynchronizedFunction(async fn)` from `#shared/util/getSynchronizedFunction`. This satisfies `no-misused-promises` without suppressing the rule.

## Error Handling

- **Never `new Error(...)`** — throw `new InvalidOperationError(operation, name, message)` from `@esposter/shared`.
- Pick the appropriate `Operation` value (`Operation.Read`/`Create`/`Update`/`Delete`, etc.).
- Use the resource name (`file.name`, entity ID) as `name`; fall back to the calling function's name (`deserializeJson.name`) if none better.
- User-supplied JSON (uploads, external input): use Zod `safeParse` and throw `InvalidOperationError` on failure — never bare `JSON.parse` with a cast.
- Validated endpoint data: `jsonDateParse` from `@esposter/shared` is acceptable.

## Control Flow

- **Guard clauses first** — `if (!condition) return` to exit early instead of wrapping the body in `if`. Invert and return early aggressively.
- **Combine consecutive guards with `||`** when they share the same return value:

  ```ts
  // GOOD
  if (!editedItem.value?.dataSource || editedItem.value.dataSource.columns.some(({ name }) => name === newColumn.name))
    return;
  ```

  Exception: when the second check has side effects or depends on the first passing.

- **Use `.includes()` for 2+ equality checks** — `[A, B].includes(x)` not `x === A || x === B`. Extract to a named constant only if reused.
- **Use `switch` for type-based branching** — branching on an enum/discriminant with multiple cases uses `switch` (with `exhaustiveGuard` in the default), not an `if/else if` chain. Use `if/else if/else` only for non-enum expressions or exactly two branches.
- **Always use `if/else if/else` from the first branch** — no standalone `if` followed by `else if`, even when the first branch is a guard clause: `if (!x) return; else if (y) return z;` is correct. Only omit `else` when branches are genuinely independent (different concerns, not a logical chain).
- **Do not convert balanced `if/else` into a guard clause** — guard clauses are only correct when the remainder of the function is the single happy path. When two branches are parallel paths of similar weight, keep `if/else`; converting either duplicates shared steps or obscures mutual exclusivity. A reviewer suggesting "use a guard clause" is a false positive when the `else` branch contains substantial work.

## Return Type Annotations

**Prefer inferred return types** — don't annotate when TypeScript infers correctly. Annotate only when (a) the inferred type is too broad and you want a narrower contract (e.g. `ComputedRef<ValidationRule>` instead of `ComputedRef<(value: string) => string | true>`), or (b) the function is a public API boundary. Never add redundant annotations for documentation. Applies to service functions too (don't annotate `Promise<Map<string, bigint>>` when inferable).

## Helper Functions

**Don't extract helpers that add no value** — if a helper just wraps an inline object literal or single expression without reuse or meaningful abstraction, use the value directly. Three lines of inline code beats a named wrapper used once.

## Exhaustive Switch Guards

Every `switch` on an enum or discriminated-union discriminant must have `default: exhaustiveGuard(value)` (or `return exhaustiveGuard(value)` in return-position). Import `exhaustiveGuard` from `@esposter/shared`. This surfaces a compile error when a new variant is added without updating the switch.

```ts
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

Applies to nested switches too (each inner enum switch needs its own guard). **Exception**: switches on non-enum values (strings, numbers, class instances) don't need a guard.

## Enum Naming

**Never abbreviate enum value names** — full word: `Absolute` not `Abs`, `Subtract` not `Sub`, `Configuration` not `Config`. Applies to both key and string value.

## Enum Extension via mergeObjectsStrict

When a large enum has a meaningful "base" subset handled separately, split it:

1. Declare **named sub-groups used independently** as exported enums in their own files (e.g. `BasicStringTransformationType.ts`).
2. Declare **unlabelled/catch-all values** (e.g. `Interpolate`) as an **unexported `enum BaseXxxType`** inside the merged type's file — never a separate file.
3. Merge with `mergeObjectsStrict` from `@esposter/shared`; export the union type using enum type names.

```ts
// BasicStringTransformationType.ts (exported — sub-functions accept this for exhaustive switch)
export enum BasicStringTransformationType {
  LowerCase = "LowerCase",
  TitleCase = "TitleCase",
  Trim = "Trim",
  UpperCase = "UpperCase",
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

**Why**: functions like `computeStringTransformation` accept `BasicStringTransformationType` so their `switch` stays exhaustive (TypeScript verifies all cases; `default: exhaustiveGuard` is truly unreachable). `mergeObjectsStrict` makes `StringTransformationType.LowerCase`/`.Interpolate` work identically to a plain enum at call sites. Keeping the catch-all unexported and co-located avoids polluting exports.

## Enum Values Array

- **Export a pluralized `Set` from the enum file only when `Object.values` is actually used** — `export const EnumNames = new Set(Object.values(EnumName))` at the bottom (after the Zod schema). Don't add pre-emptively if never iterated/checked. Use it at every call site.

  ```ts
  export const BooleanFormats = new Set(Object.values(BooleanFormat));
  BooleanFormats.has(format); // O(1)
  for (const f of BooleanFormats) { ... } // Set is iterable
  Array.from(BooleanFormats, fn); // map over a Set
  ```

- **Never write `Object.values(SomeEnum)` inline** — use the exported `Set`.

## Iterating Non-Array Iterables (Set, Map, etc.)

- **`Array.from(iterable, mapFn)` over `[...iterable].map(mapFn)`** — the two-arg form maps while converting, producing no intermediate array. Use for any `Set`/`Map`/non-array iterable:

  ```ts
  // CORRECT — Set
  Object.fromEntries(Array.from(VisualTypes, (v) => [v, {}]));
  // CORRECT — Map (iterates as [key, value]; no .entries() needed)
  Array.from(participantsMap, ([roomId, participants]) => ({ participants, roomId }));
  ```

  Spread + `.map()` is only acceptable when a plain array is already the source.

- **Never `new Set` just to call `.has()` on a small non-enum array** — if values are unique and the array is small, use `.some()`. `Set` only for enums or large collections.

## Loops — `for...of` + `.entries()`, Destructure, No Dead Vars

- **`.forEach()` is BANNED** — use `for...of`.
- **No index-based `for (let i = 0; i < arr.length; i++)`** for plain array iteration — use `for...of`. When the index is needed (parallel arrays, offsets), use `.entries()`: `for (const [i, item] of arr.entries())`. The `.entries()` iterator cost is negligible (tiny per-element pair alloc, JIT-friendly) versus the readability win — it does not "drop perf hugely".
- **Index-based `for` stays** only when the loop genuinely isn't sequential array iteration: step counters (`i += 4`, `i += BATCH_SIZE`), pure counts (`for (let i = 0; i < 3; i++)`), `<=` bounds, multi-condition bounds, or in-body index mutation/lookahead (e.g. `line.charAt(i + 1)` then `i++`).
- **Destructure in the binding position (loop var, function param) straight to the props you use** — don't bind the whole object then read its fields. `for (const [i, { id }] of files.entries())` not `for (const [i, file] of ...) { ...file.id... }`. Destructure multiple: `for (const [i, { name, size, type }] of files.entries())`. This _removes_ the intermediate binding, so it does **not** conflict with the "no unnecessary destructure" rule (which bans adding a separate `const { x } = obj` line for a single use). Binding-position destructure = fewer vars; a standalone destructure statement for one use = more syntax. Keep the whole binding only when the object is passed on as a whole (`set(user.id, user)`) or used too many ways to enumerate cleanly.
- **Don't declare intermediate vars that are used once** — `const pastedRow = takeOne(this.#pastedValues, rowOffset)` disappears entirely once you bind it via `.entries()`. Inline single-use values; only name a var when it's referenced more than once or the name adds clarity.
- **Bound a zip with `break`, not a dual condition** — iterate the driving array via `.entries()` and `if (i >= other.length) break;` instead of `for (let i = 0; i < a.length && i < b.length; i++)`.

## Environment Checks

**Never use `import.meta.dev` or `import.meta.env.MODE` directly** — use `IS_PRODUCTION`/`IS_DEVELOPMENT`/`IS_TEST` from `#shared/util/environment/constants`:

```ts
import { IS_PRODUCTION } from "#shared/util/environment/constants";
const baseUrl = IS_PRODUCTION ? PRODUCTION_URL : DEVELOPMENT_URL;
```

## Options Argument Defaults

- **Destructure with defaults in the parameter itself** — the most elegant form for an options/config argument. Never a separate `const { x = false } = options;` line, and never `options.x ?? false` at the use site.

  ```ts
  // CORRECT — defaults live in the destructured parameter
  export const createThing = ({ overlay = false }: Partial<ThingOptions> = {}): Thing => { ... };

  // WRONG — extra line
  export const createThing = (options: Partial<ThingOptions> = {}): Thing => {
    const { overlay = false } = options;
    ...
  };

  // WRONG — default scattered to the use site
  export const createThing = (options: Partial<ThingOptions> = {}): Thing => create({ overlay: options.overlay ?? false });
  ```

## Enum Refs

- **Never `ref<EnumType | null>(null)`** — default to a sensible first value: `ref(DataSourceType.Csv)`, `ref(ColumnType.String)`.
- **Never `ref<EnumType>(EnumValue)`** — TypeScript infers the type from the value: `ref(ColumnType.String)`.

## `string` — Always Use `""` as Empty Sentinel

Prefer `string` with `""` as the absent/empty sentinel. Do not use `string | undefined` for any app-owned string value.

- **`ref<string>()` is BANNED** — always `ref("")`.
- **`useDataMap<string | undefined>(..., undefined)` is BANNED** — use `useDataMap(..., "")`.
- **`MaybeRefOrGetter<string | undefined>` is BANNED for currentId params** — always `MaybeRefOrGetter<string>`; internal `if (!currentIdValue)` guards handle `""`.
- **`cursor?: string` is BANNED** — always `cursor: string` with `z.string().default("")`; server checks `if (cursor)` so `""` means no cursor.
- **`nextCursor = ""`** — `CursorPaginationData.nextCursor` is always `string`; `""` means no next page.
- **Resetting**: assign `""` not `undefined`. Never `value || undefined` before an API call — pass `""` directly.
- **`currentRoomId`** and similar route-derived IDs return `""` (not `undefined`) when absent.

**Legitimate exceptions (third-party boundaries only):**

- Browser API properties genuinely optional with no default (e.g. `MediaRecorder.mimeType`).
- Vue Router param casts: `route.params.x as string | undefined` — normalise at the boundary, guard with `if (x)` immediately after.
- Node.js `req.socket.remoteAddress` and similar network properties.

## `null` vs `undefined`

Prefer `undefined` for all absent/optional values in app-owned code. `null` is only permitted at the external system boundary.

**App-owned code — always `undefined`:**

- String refs use `ref("")` (see above), not `ref<string>()`.
- Optional interface fields use `?:` (implies `| undefined`), not `| null`.
- Uninitialised state, optional params, absent returns are all `undefined`.
- Never `?? null` — if the left side is already `T | undefined`, drop the fallback.
- `.nullable()` is **BANNED** in app-owned Zod schemas — use `.optional()`.

**External boundary — keep `null` where required:**

- **Drizzle ORM** — nullable columns infer as `T | null`; convert via `nullToUndefined` from `@esposter/shared` before values enter app code.
- **Azure SDK / EventGrid** — `SerializableValue`, EventGrid data shapes; keep raw types, convert on ingress.
- **Vuetify** — a few Vuetify props are typed `T | null`; use `null` only where the prop type requires it, with a comment explaining why.

When checking `null` at a boundary, use `=== null` (strict equality).

## Stable Identifiers for Selections

**Track selections by stable ID, not name or index** — names change, indices shift on delete/reorder. Use `entity.id` (UUID) as the key for selected/active items. A stale ID is harmless; a stale name/index is a bug.

## Generic Definition Arrays — `as const` Without `satisfies`

When a definition array has entries typed `Definition<T>` where `T` controls a **contravariant** position (e.g. a callback parameter `format: (value: ColumnStats[T]) => string`), `satisfies readonly Definition[]` widens each entry to `Definition<KeyUnion>` and fails on contravariance.

**Fix**: drop `satisfies`, use `as const` alone. Each entry keeps its specific `Definition<"specificKey">` type from the `define*` helper.

```ts
// satisfies readonly ColumnStatDefinition[] FAILS (widens T → function param too broad)
// as const alone PASSES — preserves ColumnStatDefinition<"nullCount">, etc.
export const ColumnStatDefinitions = [
  defineColumnStat({ key: "nullCount", format: (value) => String(value), ... }),
  ...
] as const;
```

At call sites where the entry is destructured (losing key↔format correlation), cast with `as never`:

```ts
format(item[key] as never); // safe: key and format always come from the same entry
```

## Filter-Based Type Narrowing

**No redundant type guards after a filtering condition** — if a `.filter()` predicate narrows the type (e.g. `filter((v) => typeof v === "number")`), the result is already `number[]`. Don't add `: v is number` or a cast inside the callback.

Exception: when the predicate is a function reference (`filter(Boolean)`) TypeScript can't narrow, a type predicate is still needed.

## Polymorphic Dispatch — No Switch Statements

**NEVER** write a function that switches over a discriminant enum to call different logic per case ("type switch dispatcher") — it concentrates all variant logic in one place, prevents co-location, and forces every new variant to touch the central function.

**Instead, use a `*ComputeMap`** where each entry is a compute function receiving the typed transformation and a context object:

```ts
// services/column/transformation/computeConvertToTransformation.ts (per-type, co-located with schema)
export const computeConvertToTransformation = (value, t: ConvertToTransformation) => ...;

// services/column/transformation/ColumnTransformationComputeMap.ts
export interface ComputeContext {
  computeSource: (sourceColumnId: string) => ColumnValue;
  findSource: (sourceColumnId: string) => DataSource["columns"][number] | undefined;
}

type TransformationComputer<T extends ColumnTransformation> = (transformation: T, context: ComputeContext) => ColumnValue;

export const ColumnTransformationComputeMap = {
  [ColumnTransformationType.ConvertTo]: (transformation, { computeSource }) =>
    computeConvertToTransformation(computeSource(transformation.sourceColumnId), transformation),
  [ColumnTransformationType.DatePart]: (transformation, { computeSource, findSource }) => {
    const sourceColumn = findSource(transformation.sourceColumnId);
    if (sourceColumn?.type !== ColumnType.Date) return null;
    // discriminant narrowing makes sourceColumn.format accessible
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

- Each per-type function lives in `services/<feature>/transformation/compute<TypeName>Transformation.ts`.
- The map file (`<Noun>ComputeMap.ts`) imports all per-type functions; each entry is a compute function.
- Export the `ComputeContext` interface so callers can implement it.
- Use `as const satisfies { [K in TheType]: TransformationComputer<Extract<Union, { type: K }>> }` — each entry typed to its specific subtype.
- Call site uses `as never` on the transformation — TypeScript can't correlate the discriminant key with the entry's expected param type.
- Discriminant narrowing (`someColumn.type !== ColumnType.Date`) gives type-safe subtype field access in computers without casts.
- Adding a variant requires only: (1) a new per-type file, (2) one new map entry.

## Opt-In Shared Interfaces for Discriminated Union Members

When some (not all) union members share a common field, define a shared interface + Zod schema that members **opt into** by extending — never force the field onto all members.

```ts
// shared/models/.../SourceColumnId.ts — opt-in base; factory takes the vjsf context key to filter the dropdown
export interface SourceColumnId {
  sourceColumnId: string;
}
export const createSourceColumnIdSchema = (getItems = ColumnFormVjsfContextPropertyNames["context.columnItems"]) =>
  z.object({
    sourceColumnId: z.string().meta({ layout: { comp: "select", getItems }, title: "Source Column" }),
  }) satisfies z.ZodType<SourceColumnId>;

// shared/models/.../SourceColumnIds.ts — multi-source variant
export interface SourceColumnIds {
  sourceColumnIds: string[];
}
export const createSourceColumnIdsSchema = (getItems = ColumnFormVjsfContextPropertyNames["context.columnItems"]) =>
  z.object({
    sourceColumnIds: z.array(z.string()).meta({ layout: { getItems }, title: "Source Columns" }),
  }) satisfies z.ZodType<SourceColumnIds>;

// Each transformation spreads the factory's .shape, passing a pre-filtered context key to constrain column types:
export const datePartTransformationSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.DatePart).readonly()).shape,
    ...createSourceColumnIdSchema(ColumnFormVjsfContextPropertyNames["context.dateColumnItems"]).shape,
    part: datePartTypeSchema,
  })
  .meta({ title: ColumnTransformationType.DatePart }) satisfies z.ZodType<DatePartTransformation>;

// A transformation needing no source column uses z.object({...}) directly:
export const mathOperationTransformationSchema = z.object({
  first: mathOperandSchema,
  steps: z.array(mathStepSchema).default([]),
  type: z.literal(ColumnTransformationType.MathOperation),
});
```

**Rules:**

- Each shared interface/schema lives in its own file (one export per file).
- Members spread the factory's `.shape` (never `.extend()` — see zod skill).
- Members not needing the field use `z.object({...})` directly.
- `SourceColumnId` (singular) for single-source, `SourceColumnIds` (plural) for multi-source.
- **Column-type filtering** happens by passing the pre-filtered vjsf context key into the factory (`createSourceColumnIdSchema(ColumnFormVjsfContextPropertyNames["context.dateColumnItems"])`), **not** via any `.meta()` field. `GlobalMeta` (`shared/types/zod.d.ts`) only carries `layout` (+ ajv keywords).
- **`ApplicableColumnTypes`** — interface in `shared/models/.../transformation/ApplicableColumnTypes.ts` (`readonly applicableColumnTypes: readonly ColumnType[]`). Used **only by non-schema definitions** (`ColumnStatisticsDefinition` via `defineColumnStatistics` in `ColumnStatisticsDefinitionMap`) — never by Zod schemas:

  ```ts
  export interface ApplicableColumnTypes { readonly applicableColumnTypes: readonly ColumnType[]; }
  export interface ColumnStatisticsDefinition<T extends ColumnStatisticsKey = ColumnStatisticsKey>
    extends ApplicableColumnTypes { compute: ...; format: ...; key: T; title: string; }

  // stat definition usage (NOT a schema):
  defineColumnStatistics({ applicableColumnTypes: [ColumnType.Number], compute: ..., format: ..., key: "average", title: "..." })
  ```

## Configuration Interfaces — `Pick` from Source Types

When a configuration interface re-declares properties already on a source type (e.g. a Phaser `GameObjects.X`), use `Pick<SourceType, "prop1" | "prop2">` in the `extends` clause instead of re-declaring each.

```ts
export interface ArcConfiguration
  extends ShapeConfiguration, Pick<GameObjects.Arc, "closePath" | "endAngle" | "radius" | "startAngle"> {}
```

Use `Pick` for all properties derived directly from the source type. Keep explicit declarations only for:

- `Parameters<SourceType["method"]>` tuples — no readable property to pick
- `Parameters<SourceType["method"]>[n]` — same
- Plain primitives (`number`, `string`) representing constructor args with no matching readable property on the source type
