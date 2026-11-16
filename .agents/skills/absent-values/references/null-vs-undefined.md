# `null` vs `undefined`

Read when choosing between `undefined` and `null`, declaring an absent property, or consuming a boundary type that carries `null`. Why one sentinel, and the boundary list with its reasoning, is `openspec/specs/architecture/null-vs-undefined/design.md`.

`undefined` is **banned in app-owned code unless it carries a meaning distinct from every real value** — including the `""` string sentinel and an absent optional property. Only reach for it when absence must be told apart from a valid value (e.g. a cache read where a stored `""` is real and `undefined` means "miss"). `null` is only permitted at the external system boundary — every `null` in the repo belongs to one of the shapes listed below, and a type keeping one names the boundary it came from.

**App-owned code — prefer absence over an explicit `undefined`:**

- Optional interface fields use `?:`, not `| null`. `exactOptionalPropertyTypes` is on everywhere, so `?:` alone means the key is left out when absent and takes no explicit `undefined`.
- **A property that may be absent is optional, never `field: T | undefined`** — `no-restricted-syntax` in `packages/configuration/eslint/typescriptRules.js` (covers interface/type-literal members, class fields, and `defineProps` interfaces in `.vue`). It is `field?: T` when every writer leaves the key out, and **`field?: T | undefined` when a value may hand it `undefined`**:
  - **a `.vue` component's props, always** — Vue reads a prop bound to `undefined` as absent, and binding `undefined` is how a template leaves a prop out (`:is-dense="dense || undefined"`);
  - **a type a tRPC or Zod input parses into** — `.optional()` parses to `T | undefined`, and superjson carries an explicit `undefined` across the wire;
  - any type a caller builds as `{ key: maybeValue }`.

  Non-property positions — parameters, return types, generic arguments, array/tuple members — keep `| undefined`, since `?:` can't express them.

- **A type of ours that is handed `undefined` takes it at its source**: a mapped `Partial<X>` parameter becomes `UndefinedOnPartial<Partial<X>>` (type-fest), and the function that writes it drops the undefined keys itself, as `createOperationData`'s `updateItem` does, so no caller massages its argument. **A value handed to a library's type whose optional field takes no `undefined`** drops its undefined keys with `omitUndefined` from `@esposter/shared` (`{ required, ...omitUndefined({ a, b }) }`), or a conditional spread for one key. Never a cast.
- **Never synthesize an explicit `undefined` value.** Model absence as the _missing optional key_, not `{ key: undefined }` — build the object conditionally (`environment ? { backend, environment } : { backend }`) so no `undefined` literal is ever written, and tests `toStrictEqual({ backend })` rather than `{ backend, key: undefined }`.
- Uninitialised state, optional params and absent returns lean on `""`/omission; add `| undefined` to a type **only** when the distinct-from-`""` rule above applies.
- Never `?? null` — if the left side is already `T | undefined`, drop the fallback.
- `.nullable()` is **banned** in app-owned Zod schemas — use `.optional()`, which parses to `T | undefined`. **A missing key and an explicit `undefined` never mean different things** — nothing branches on `"key" in`, `hasOwn` or a key count to tell them apart, and `.exactOptional()` is a `no-restricted-syntax` error, since it would refuse the `undefined` a client or superjson sends for "not set". The one place it belongs is a schema mirroring a library's type whose optional key takes no `undefined`: the schema is annotated with that type (`const jsonContentSchema: z.ZodType<JSONContent> = …` in `NoteDocument.ts`), the compiler holds the mirror to it, and the rule leaves an annotated declaration alone. ESLint's `no-restricted-syntax` fails every call; a schema refining a boundary's own nullable value disables it, naming the boundary. A class field for an absent value is `declare field?: T`, so an instance carries no own `undefined` key a parsed blob would not have. Stored data a change leaves failing the new schema is backfilled (the `backfills` skill).
- **Test object presence with a truthiness check, not `=== undefined`/`!== undefined`.** For an `Object | undefined` (or `| null`) value the absent form is falsy, so `result ? Promise.resolve(result) : fallback` and `if (!entity) return` read cleaner. Reserve explicit `=== undefined`/`=== null` for the value that could not have been given a sentinel in the first place: an index or a count where `0` is a real position, a measurement the browser hands back absent, a boundary row where `null` is the stored value. The test is whether a sentinel was available — if one was, it is taken and the comparison never appears, which is why an app-owned string never has one: `""` exists precisely so that `if (value)` is the whole check.

**External boundary — keep `null` where required:**

- **Drizzle ORM** — nullable columns infer as `T | null`, and so does an absent one-to-one relation loaded through `with` (`ResourceWithPublication.publication`); leave the boundary shape as-is and consume it at the call site (`??` onto a sentinel, truthiness guard) only where the app-owned shape is actually needed — there is no conversion layer. See `openspec/specs/architecture/null-vs-undefined/design.md`.
- **`ItemMetadata.deletedAt`** (`apps/web/shared/models/shared/ItemMetadata.ts`) — `Date | null`, the soft-delete column Drizzle's metadata columns carry (`packages/db-schema/src/createMetadataSchema.ts`), so every row satisfies it. An item stored inside a content blob is removed rather than soft deleted, so `AItemEntity` carries the timestamps without `deletedAt`, and a content schema names none.
- **Persisted JSON blobs** — `JSON.stringify` drops an `undefined` key outright, so a blob that must round-trip an empty slot stores `null`. `ColumnValue` is `boolean | null | number | string`: `null` is the empty spreadsheet cell, `""` a cell holding the empty string, and they sort, filter and count apart.
- **Third-party wire shapes** — `SerializableValue`, and any payload a provider sends; keep raw types, convert on ingress.

**A tRPC read whose row is absent answers `undefined`** — never `?? null` on a `findFirst`, which only re-spells
the absence the query already returned.

**"Not loaded yet" is `isPending`, not a third value.** The one place the rule looks like it needs an exception is a
consumer that must tell "still loading" from "loaded, no row", since `useQuery` seeds `data` as
`undefined`. `useQuery` returns `isPending` beside `data` for exactly this, and it is true on the first render
because the read claims its key synchronously during setup — so the consumer gates on the flag and the read keeps
answering `undefined`:

```vue
<!-- WordFilter/Index.vue — renders once the read has answered, row or no row -->
<template v-if="isPending"><!-- skeleton --></template>
<UiErrorState v-else-if="error" :error @retry="refresh()" />
<MessageModelRoomSettingsTypeWordFilterForm v-else :key="room.id" :room-id="room.id" :filter />
```

When checking `null` at a boundary, use `=== null` (strict equality).
