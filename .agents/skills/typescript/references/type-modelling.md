# Modelling a Type Instead of Working Around It

For the moments a type is awkward: reaching for a cast, re-declaring fields a source type already has, dispatching per variant, or a module config key the compiler can't see.

## `as unknown as` is `any` with extra steps

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

## Configuration interfaces — `Pick` from source types

When a configuration interface re-declares properties already on a source type (e.g. a Phaser `GameObjects.X`), use `Pick<SourceType, "prop1" | "prop2">` in the `extends` clause instead of re-declaring each.

```ts
export interface FooConfiguration extends BarConfiguration, Pick<SourceType, "a" | "b"> {}
```

Use `Pick` for all properties derived directly from the source type. Keep explicit declarations only for `Parameters<SourceType["method"]>` tuples and their indexed members (no readable property to pick), and plain primitives representing constructor args with no matching readable property on the source type.

The same rule covers **third-party SDK envelopes**: when our code authors or reads a subset of an SDK's own shape, `Pick` from the SDK type instead of restating the fields, and make it generic over the part that actually varies. `EventGridEventInput<TData>` in `packages/db-schema/src/models/azure/eventGrid/` is `Pick<EventGridEvent<TData>, "data" | "dataVersion" | "eventType" | "id" | "subject">` — one definition for every publisher and consumer, and it follows the SDK when the SDK moves. Never define a per-feature alias (`DeadLetteredEvent`, `WebhookEvent`, …) that just re-declares the same envelope; instantiate the generic.

## Discriminant-keyed maps — `as const satisfies` a mapped type

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
- Discriminant narrowing inside an entry (`if (foo.type !== FooType.Bar) return undefined;`) gives type-safe subtype access without casts.

## Missing `NuxtConfig` module keys — augment `nuxt.d.ts`, never touch tsconfig

When `NuxtConfig["x"]` errors in `packages/app/configuration/*.ts` because a Nuxt module's config key isn't picked up (the module relies on the generated `.nuxt/types/modules.d.ts` instead of shipping its own `nuxt/schema` augmentation), **NEVER edit `tsconfig.root.json` or any tsconfig `include`**. Add the key to the existing `declare module "nuxt/schema"` block in `packages/app/shared/types/nuxt.d.ts`, importing the module's exported `ModuleOptions`:

```ts
import type { ModuleOptions as ContentModuleOptions } from "@nuxt/content";

declare module "nuxt/schema" {
  interface NuxtConfig {
    content?: Partial<ContentModuleOptions>;
  }
}
```

## A large third-party JSON dataset — declare the module, never let TypeScript read it

Importing a data file directly makes TypeScript infer the literal type of every key in it — a cost paid on every
typecheck, for a type nothing wants. Some packages also point `types` at a file they do not publish.

Declare the shape in `app/types/<package>.d.ts`, with **no top-level imports** (they would turn `declare module`
into an augmentation, which fails when the target has no types). Reach the record interface inline instead:

```ts
declare module "unicode-emoji-json/data-by-emoji.json" {
  const dataByCharacter: Record<string, import("@/models/message/emoji/UnicodeEmojiRecord").UnicodeEmojiRecord>;
  export default dataByCharacter;
}
```

The interface lives in `app/models/`, models the **whole** record rather than the fields today's caller reads,
and keeps the source's casing verbatim — a `/* eslint-disable camelcase */` with a reason beats renaming keys
the file does not have. Optionality is looked up in the data, never guessed. It earns one shape test
(`testing` skill).
