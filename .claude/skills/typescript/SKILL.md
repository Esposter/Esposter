---
name: typescript
description: Esposter TypeScript conventions — banned patterns (Omit over Except, forEach, parameter properties, the void operator), as unknown as treated like any (model the type instead; the rare mock and library-seam exceptions), declare over ! on class fields, arrow functions and overloads, neverthrow promise style, InvalidOperationError, guard clauses, exhaustive switch guards, enum naming/refs/values arrays, discriminant-keyed maps for polymorphic dispatch, and the string "" sentinel with the null-vs-undefined rules. Apply when writing any TypeScript in this project.
---

# TypeScript Conventions

## Core Rules

- `strict` mode + `tseslint.configs.strictTypeChecked`. `any`, non-null assertions (`!`), and `==`/`!=` are lint errors (`no-explicit-any`, `no-non-null-assertion`, `eqeqeq`) — for `!` prefer a guard clause or optional chaining over a cast, and see Class Fields for the `field!: T` form.
- `Omit` → `Except` from `type-fest`, enforced by `@typescript-eslint/no-restricted-types`. Import it from `type-fest` directly; it is **not** re-exported from `@esposter/shared`.
- **No parameter properties** — never `constructor(private readonly foo: T)`. Declare fields explicitly and assign in the body.
- **`private` → ECMAScript `#`** (`no-restricted-syntax` in `packages/configuration/eslint/typescriptRules.js`). Keep `readonly` when converting (`private readonly foo` → `readonly #foo`); `protected` stays, as `#` is inaccessible to subclasses.
- `.forEach()` is **BANNED** — use `for...of` (see Loops). Not lint-enforced; hold the line in review.
- `type` aliases for object shapes → `interface` (`consistent-type-definitions`).
- **Prefer non-mutating array methods** (copy versions returning a new array):
  - `arr.toSorted(fn)` not `[...arr].sort(fn)` — `sort()` **BANNED**
  - `arr.toReversed()` not `[...arr].reverse()` — `reverse()` **BANNED**
  - `arr.toSpliced(...)` not manual splice+spread — `splice()` **BANNED** for producing new arrays (still allowed for in-place mutation of store/reactive arrays)
  - `arr.with(index, value)` not `[...arr.slice(0, i), value, ...arr.slice(i + 1)]`
- **`new Set` only for dedup** — use `.some()` for unique arrays. `Set` only when (a) deduplication is the goal, or (b) collection large enough that O(n) `.some()` hurts perf.
- **Never declare what nothing uses** — every export (schema, type, constant, pluralized enum array) earns its existence with a call site; no speculative API. When removing the last consumer of an export, cascade-delete the newly orphaned export and its now-unused imports too.
- Named imports from libraries, but only when not auto-imported by Nuxt/modules (`ref`, `computed`, `watch` from Vue; `storeToRefs` from Pinia; all VueUse composables are auto-imported — never import manually).
- **Use the `node:` protocol for Node.js built-ins** — `import { readFileSync } from "node:fs"`, never bare `"fs"`/`"path"`/`"crypto"`. Enforced by `unicorn/prefer-node-protocol`.
- **Never import ambient globals** — `process`, `console`, `Buffer`, `URL`, `fetch`, etc. are already global; use them directly, never `import process from "node:process"`. Only import the built-ins that aren't ambient (`node:fs`, `node:path`, `node:crypto`, …).
- Explicitly type variables with proper types.
- **Never generic variable names like `parsed`** — use a name including the type: `parsedDate`, `parsedResult`.
- **No `current*` caching of `.value`** just to use it once. If narrowing is needed after a guard, assign a descriptive name (`const selectedFile = file.value`). Prefer plain `const` over `computed()` when the source is already non-reactive (e.g. a `readonly` prop field).
- **Cloning** — `structuredClone(obj)` for deep clones; `Object.assign(structuredClone(obj), { ...updates })` to clone+override. Never `{ ...spread }` to clone a class instance (loses prototype). **Exception**: `structuredClone(new ClassName(...))` when a plain object is explicitly required (e.g. Vjsf rejects class instances) — add a comment explaining why.
- **Boolean casting** — never `!!`; always `Boolean(value)`.

## Type Assertions — `as unknown as` Is `any` With Extra Steps

`as unknown as T` launders a value past every check the compiler would have run, which is the same hole `no-explicit-any` exists to close — it just isn't lint-enforceable, so hold the line in review. Treat every one as needing a **stated reason the type cannot be modelled**; the default answer is that it was simply never modelled:

| Instead of asserting                            | Model it                                                                                                       |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| External/boundary data into a type              | Parse it with Zod — the `zod` skill owns this, and it is the one case where the cast is a **bug**              |
| A generic seam (a client, a db, a search index) | Pass the type parameter (`Library<TDocument>`), or return the driver-agnostic supertype both sides satisfy     |
| A prototype you are extending                   | `Object.assign(Proto, { method() {} })` — a runtime lookup needs no static claim, so nothing has to be lied to |
| An untyped third-party package                  | An ambient `declare module "pkg"` — one `.d.ts` beats a suppression per import site                            |
| Two shapes that "are really the same"           | One discriminated union, or a `satisfies`-checked adapter at the seam                                          |

What survives is **seams the type system genuinely cannot express**. Most live in a mock or a `.test.ts`:

- **A fake standing in for an SDK type with private or branded members** — an Azure SDK response carries `_response`/private brands a mock cannot structurally satisfy. This is the whole job of `azure-mock`/`db-mock`, and the `testing` skill sanctions it.
- **A `vi.mock` factory replacing an overloaded function** — `vi.fn<typeof overloadedFn>()` cannot reproduce an overload set, hence `mockFn as unknown as typeof overloadedFn`.
- **The mixin limitation** — a class expression extending a generic `TBase` cannot be inferred back to its mapped return type.

A few are unavoidable in production source, and both known kinds share a tell — **TS refuses the single `as T` for want of overlap**, which is the compiler confirming there is nothing to narrow rather than you overruling it:

- **A library result type that cannot express what it carries** — e.g. a search hit that declares none of the fields the index was told to store. There is no index signature to annotate against and no overlap to cast through.
- **A transform whose key mapping is runtime-only** — `Object.fromEntries` over renamed keys types as a bare `Record`, which overlaps no class. Restate the shape only where something else already pins it (the source's own document type).

Prefer a single `as T` whenever TS accepts it, and comment **what the compiler cannot see** — never "this is safe". Adding one to production source earns the same scrutiny as reaching for `any`: if the shape is worth asserting, it is worth declaring.

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

## Regex

Literals for static patterns, `new RegExp(template, flags)` only when the pattern interpolates, and always the `u` flag — all three are lint errors otherwise (`prefer-regex-literals`, `require-unicode-regexp`). Naming (`_REGEX`) is the naming skill's rule.

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

- **`try`/`catch` is BANNED** for fallible work — use neverthrow `getResult`/`getResultAsync` (+ `withFinalizer`/`withFinalizerAsync` for cleanup, never `try`/`finally`); never `.catch()` chains. Full patterns, utilities, consumption rules, and Azure Functions logging/retry live in the **error-handling** skill.
- **`.then()` exception**: acceptable only for a **promise queue** (serialising sequential async ops in a sync context, e.g. `chain = chain.then(async () => {...})`) — can't be expressed with `await` in a sync watcher/callback. All other `.then()`/`.catch()` must be converted.
- **Never `await import(...)`** for code-splitting — always static top-level `import`. Components are already chunk-split per component by the build, so a nested dynamic import only hides the dependency and (in dev) defers Vite discovery until first use, which can trigger a mid-session re-optimization that leaves chunks referencing stale dep hashes. Only touch `optimizeDeps` when the dependency's own docs instruct it. Sole exception: a library-mandated lazy-loader contract (e.g. CodeMirror `LanguageDescription.of({ load })`).

### Replacing `void asyncFn()`

`no-void` is an error (`.oxlintrc.json`, covering `.ts` and `.vue`); the only `void` in the codebase lives inside `getSynchronizedFunction`. It's banned because it silences `no-floating-promises` by discarding the promise — rejections go unhandled and the caller can't await completion. When you reach for it, stop at the first step that applies:

1. **Can the enclosing function be `async`?** Make it `async` and `await`. This covers nearly every case, including Vue template/emit handlers (`@click`, `@confirm`) and any callback typed `Promisable<void>` — Vue doesn't care that a handler returns a promise, so `onClick: async () => { await ... }` needs no wrapper.
2. **Do you own the callback's type?** Widen it to `Promisable<void>` (`type-fest`) and `await` it at the call site. Never force callers to `void` their async work. Always the `Promisable<T>` alias — never a hand-written `Promise<T> | T` union; this applies to every maybe-async signature, not just this replacement flow.
3. **Third-party sync slot you genuinely cannot change** (`onScopeDispose`, `addEventListener`, Phaser callbacks) — wrap with `getSynchronizedFunction(asyncFn)` (`#shared/util/function/getSynchronizedFunction`, explicit import). The **only** sanctioned fire-and-forget: it drops the promise just like `void`, so it's a last resort, not a shortcut past steps 1–2.

If none apply (sync body, no callback slot to widen), restructure so the sync teardown stays sync and the promise is awaited last — don't `void` it.

## Error Handling

- **Never `new Error(...)`** — throw `new InvalidOperationError(operation, name, message)` from `@esposter/shared`.
- Pick the appropriate `Operation` value (`Operation.Read`/`Create`/`Update`/`Delete`, etc.).
- Use the resource name (`file.name`, entity ID) as `name`; fall back to the calling function's name (`deserializeJson.name`) if none better.
- User-supplied JSON (uploads, external input): use Zod `safeParse` and throw `InvalidOperationError` on failure — never bare `JSON.parse` with a cast.
- Validated endpoint data: `jsonDateParse` from `@esposter/shared` is acceptable.
- **JSON containing dates** (localStorage, blobs, any `JSON.stringify` round trip): parse with `jsonDateParse` — its reviver restores ISO strings to `Date`s, so the Zod schema keeps plain `z.date()`. Never `JSON.parse` + `z.coerce.date()`.

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

- **Export a pluralized values collection from the enum file only when it's actually used** — at the bottom (after the Zod schema). Never pre-emptively: an export with zero call sites is dead code.
- **Plain `Object.values` array by default, `new Set` only when Set functionality is genuinely used** — enum values are unique by construction, so a Set adds nothing for iteration and forces `[...EnumNames]` spreads at every array call site (`v-for`, `.map`, `.filter`, `.join` all want arrays). Reach for a Set only when call sites actually use `.has()`/`.difference()` or the source can contain duplicates (e.g. `ContentTypes` dedupes mime-type values):

  ```ts
  // Default — plain array; iterate, map, filter, join directly with no spreads
  export const PostSortTypes = Object.values(PostSortType);

  // Set — earned by real membership checks at the call sites
  export const NumberFormats: ReadonlySet<NumberFormat> = new Set(Object.values(NumberFormat));
  NumberFormats.has(format); // O(1)
  ```

  In published packages (`db-schema` etc., isolatedDeclarations) annotate the array explicitly: `export const MessageTypes: readonly MessageType[] = Object.values(MessageType);`. In the app, let it infer.

- **Never write `Object.values(SomeEnum)` inline** — use the exported array.
- **The values array lives in the source's own file, never at a consumption site** — a `const FooTypes = Object.values(FooType)` declared locally in a service/component (or duplicated across two consumers) is the violation shape even when typed and named correctly; move it to the enum's file and import it. Same rule for map-derived collections: `export const FooDefinitions = Object.values(FooDefinitionMap)` sits at the bottom of the map's file. Exception: test files may derive values locally when the point of the test is independently re-deriving them (e.g. exhaustiveness assertions against a map).

## Iterating Non-Array Iterables (Set, Map, etc.)

- **`Array.from(iterable, mapFn)` over `[...iterable].map(mapFn)`** — the two-arg form maps while converting, producing no intermediate array. Use for any `Set`/`Map`/non-array iterable:

  ```ts
  // CORRECT — Set
  Object.fromEntries(Array.from(VisualTypes, (v) => [v, {}]));
  // CORRECT — Map (iterates as [key, value]; no .entries() needed)
  Array.from(participantsMap, ([roomId, participants]) => ({ participants, roomId }));
  ```

  Spread + `.map()` is only acceptable when a plain array is already the source.

## Loops — `for...of` + `.entries()`, Destructure, No Dead Vars

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
- **Filter/selection refs where "nothing selected" is a real state** use the string-enum `""` sentinel — `ref<"" | EnumType>("")` — never `| null` or `| undefined`. Pair with an explicit "All …" select item (`value: ""`), never `clearable` (see the vuetify skill).
- **Prefer inferred refs** — `ref("")`, `ref(0)`, `ref(EnumType.Value)`. Annotate only when the value space genuinely exceeds the seed: `ref<"" | EnumType>("")`, literal-union inputs like `ref<CreateInviteInput["maxUses"]>(0)`.

## `string` — Always Use `""` as Empty Sentinel

Prefer `string` with `""` as the absent/empty sentinel. Do not use `string | undefined` for any app-owned string value.

- **`ref<string>()` is BANNED** — always `ref("")`.
- **`useDataMap<string | undefined>(..., undefined)` is BANNED** — use `useDataMap(..., "")`.
- **`MaybeRefOrGetter<string | undefined>` is BANNED for currentId params** — always `MaybeRefOrGetter<string>`; internal `if (!currentIdValue)` guards handle `""`.
- **`cursor?: string` is BANNED** — always `cursor: string` with `z.string().default("")`; server checks `if (cursor)` so `""` means no cursor.
- **`nextCursor = ""`** — `CursorPaginationData.nextCursor` is always `string`; `""` means no next page.
- **Resetting**: assign `""` not `undefined`. Never `value || undefined` before an API call — pass `""` directly.
- **`currentRoomId`** and similar route-derived IDs return `""` (not `undefined`) when absent.
- **Checking**: never compare against the sentinel (`value === ""` / `value !== ""`) — use the truthy/falsy check directly: `if (value)`, `value ? a : b`, `.filter((line) => Boolean(line))`. Comparing to `""` survives ONLY where falsy values diverge: `number | ""` unions (`0` is a real value, `""` is empty — `minimum !== ""` is load-bearing) and code that distinguishes `""` from `undefined` with different behavior for each (e.g. `image === ""` = clear it, `undefined` = leave unchanged).

**Legitimate exceptions (third-party boundaries only):**

- Browser API properties genuinely optional with no default (e.g. `MediaRecorder.mimeType`).
- Vue Router param casts: `route.params.x as string | undefined` — normalise at the boundary, guard with `if (x)` immediately after.
- Node.js `req.socket.remoteAddress` and similar network properties.

## Sentinels Propagate End-to-End

A client ref seeded with its sentinel (`""`, `0`, first enum value) always sends the field, so the API input declares it **required** with the sentinel in its value space — never `.partial()`/`.optional()`/`.default()` machinery or `?? undefined` normalisation at the call site. The server truthiness-guards (`if (type) ...`). Minimal code: one value space from ref to query.

- Plain `string` fields already contain `""` — reuse the source schema untouched: `entitySchema.pick({ actorUserId: true })`, non-partial.
- Enum fields union the sentinel: `type: entitySchema.shape.type.or(z.literal(""))`.
- **Numbers use `0`** when `0` has no domain meaning — invite `expireAfterMinutes`/`maxUses`: `0` = never expires / unlimited (`z.literal([...OPTIONS, 0])`, never `.nullable()`).
- **The DB schema itself carries the sentinel** — `maxUses: integer().notNull().default(0)`, never a nullable column plus manual `|| null` mapping in the router. The DB schema is the source of truth for types (that's why we use Drizzle); the sentinel flows ref → input → row → read untouched. Only types with no empty value (timestamps) stay nullable, mapped once at the insert site.
- Reserve `.default("")` for fields genuinely omitted by some callers (e.g. `cursor` on the first page request).

## `null` vs `undefined`

`undefined` is **banned in app-owned code unless it carries a meaning distinct from every real value** — including the `""` string sentinel and an absent optional property. Only reach for it when absence must be told apart from a valid value (e.g. a cache read where a stored `""` is real and `undefined` means "miss"). `null` is only permitted at the external system boundary.

**App-owned code — prefer absence over an explicit `undefined`:**

- String refs use `ref("")` (see above), not `ref<string>()`.
- Optional interface fields use `?:` (implies `| undefined`), not `| null`.
- **Never synthesize an explicit `undefined` value.** Model absence as the _missing optional key_, not `{ key: undefined }` — build the object conditionally (`environment ? { backend, environment } : { backend }`) so no `undefined` literal is ever written, and tests `toStrictEqual({ backend })` rather than `{ backend, key: undefined }`.
- Uninitialised state, optional params, absent returns lean on `""`/omission; add `| undefined` to a type **only** when the distinct-from-`""` rule above applies.
- Never `?? null` — if the left side is already `T | undefined`, drop the fallback. Likewise never `?? SomeEnum.None` (see enums below).
- `.nullable()` is **BANNED** in app-owned Zod schemas — use `.optional()`.
- **Test object presence with a truthiness check, not `=== undefined`/`!== undefined`.** For an `Object | undefined` (or `| null`) value, the absent form is falsy, so `result ? Promise.resolve(result) : fallback` and `if (!entity) return` read cleaner than an explicit `=== undefined` comparison. Reserve explicit `=== undefined` for the rare value whose falsy members (`0`, `""`, `false`) are valid and must be distinguished from absent — but app-owned strings use the `""` sentinel and are compared with `=== ""`, not truthiness.

**Enums — no `None`/sentinel member for "absent":**

- An enum lists only _real_ variants. Represent "nothing selected / no preset" as an **optional, omitted field** (`environment?: Environment`), not a fake `Environment.None` member — the same "absence is the missing key" rule. Resolvers accept `Environment | undefined` and guard `if (!environment)`; config schemas use `z.enum(E).optional()`, not `.default(E.None)`; generators/CLI pickers omit the key rather than writing a `none` value.
- Keep a sentinel member only when that value is a genuinely distinct, selectable state the domain acts on (rare) — not merely "not chosen".

**External boundary — keep `null` where required:**

- **Drizzle ORM** — nullable columns infer as `T | null`; convert via `nullToUndefined` from `@esposter/shared` before values enter app code.
- **Azure SDK / EventGrid** — `SerializableValue`, EventGrid data shapes; keep raw types, convert on ingress.
- **Vuetify** — a few Vuetify props are typed `T | null`; use `null` only where the prop type requires it, with a comment explaining why.

When checking `null` at a boundary, use `=== null` (strict equality).

## Stable Identifiers for Selections

**Track selections by stable ID, not name or index** — names change, indices shift on delete/reorder. Use `entity.id` (UUID) as the key for selected/active items. A stale ID is harmless; a stale name/index is a bug.

## Discriminant-Keyed Maps — `as const satisfies` a Mapped Type

A collection of per-variant definitions is an **object keyed by the discriminant**, closed with `as const satisfies { [K in Discriminant]: Definition<K> }` — never a flat array, and never `satisfies readonly Definition[]`. A union-typed `satisfies` widens each entry's `T` to the full key union, which breaks on any contravariant position (a `format: (value: Values[T]) => string` callback param); the mapped type pins each entry to its own key, so it typechecks _and_ keeps the specific type.

```ts
export const FooDefinitionMap = {
  bar: defineFoo({ key: "bar", compute: (context) => ..., format: (value) => String(value) }),
  // ...
} as const satisfies { [K in FooKey]: FooDefinition<K> };

export const FooDefinitions = Object.values(FooDefinitionMap);
```

The same shape drives **polymorphic dispatch**. Never write a function that switches over a discriminant to call different logic per case — it concentrates every variant in one place and forces each new variant to touch it. Key a map by the discriminant instead, and let the dispatcher be one expression:

```ts
export const FooComputeMap = {
  [FooType.Bar]: (item, { resolve }) => computeBar(resolve(item.sourceId), item),
  [FooType.Baz]: (item, { resolve, find }) => { ... },
} as const satisfies { [K in FooType]: (item: Extract<Foo, { type: K }>, context: ComputeContext) => Value };

return FooComputeMap[foo.type](foo as never, { find, resolve });
```

- Each per-variant function lives in its own co-located file; the map file imports them. Adding a variant = one new file + one map entry.
- Export the `ComputeContext` interface so callers can implement it.
- **`as never` at the call site** is required and safe wherever the key↔entry correlation is lost — dispatching by a runtime key (`Map[foo.type](foo as never)`), or destructuring an entry (`format(item[key] as never)`). TypeScript can't correlate the key with the entry's parameter type.
- Discriminant narrowing inside an entry (`if (column.type !== ColumnType.Date) return null;`) gives type-safe subtype access without casts.

## Filter-Based Type Narrowing

**No redundant type guards after a filtering condition** — if a `.filter()` predicate narrows the type (e.g. `filter((v) => typeof v === "number")`), the result is already `number[]`. Don't add `: v is number` or a cast inside the callback.

Exception: when the predicate is a function reference (`filter(Boolean)`) TypeScript can't narrow, a type predicate is still needed.

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

## Missing `NuxtConfig` Module Keys — Augment `nuxt.d.ts`, Never Touch tsconfig

When `NuxtConfig["x"]` errors in `packages/app/configuration/*.ts` because a Nuxt module's config key isn't picked up (the module relies on the generated `.nuxt/types/modules.d.ts` instead of shipping its own `nuxt/schema` augmentation), **NEVER edit `tsconfig.root.json` or any tsconfig `include`**. Add the key to the existing `declare module "nuxt/schema"` block in `packages/app/shared/types/nuxt.d.ts`, importing the module's exported `ModuleOptions`:

```ts
import type { ModuleOptions as ContentModuleOptions } from "@nuxt/content";

declare module "nuxt/schema" {
  interface NuxtConfig {
    content?: Partial<ContentModuleOptions>;
  }
}
```
