# `null` vs `undefined`

Read when choosing between `undefined` and `null`, declaring an absent property, or consuming a boundary type that carries `null`. Why one sentinel, and the boundary list with its reasoning, is `apps/web/content/docs/architecture/null-vs-undefined.md`.

`undefined` is **banned in app-owned code unless it carries a meaning distinct from every real value** — including the `""` string sentinel and an absent optional property. Only reach for it when absence must be told apart from a valid value (e.g. a cache read where a stored `""` is real and `undefined` means "miss"). `null` is only permitted at the external system boundary — every `null` in the repo belongs to one of the shapes listed below, and a type keeping one names the boundary it came from.

**App-owned code — prefer absence over an explicit `undefined`:**

- Optional interface fields use `?:` (implies `| undefined`), not `| null`.
- **A property whose absent form is `undefined` must be declared `field?: T`, never `field: T | undefined`** — `no-restricted-syntax` in `packages/configuration/eslint/typescriptRules.js` (covers interface/type-literal members, class fields, and `defineProps` interfaces in `.vue`). Non-property positions — parameters, return types, generic arguments, array/tuple members — keep `| undefined`, since `?:` can't express them.
- **Never synthesize an explicit `undefined` value.** Model absence as the _missing optional key_, not `{ key: undefined }` — build the object conditionally (`environment ? { backend, environment } : { backend }`) so no `undefined` literal is ever written, and tests `toStrictEqual({ backend })` rather than `{ backend, key: undefined }`.
- Uninitialised state, optional params and absent returns lean on `""`/omission; add `| undefined` to a type **only** when the distinct-from-`""` rule above applies.
- Never `?? null` — if the left side is already `T | undefined`, drop the fallback.
- `.nullable()` is **banned** in app-owned Zod schemas — use `.optional()`. ESLint's `no-restricted-syntax` fails every call; a schema refining a boundary's own nullable value disables it, naming the boundary. A class field for an absent value is `declare field?: T`, so an instance carries no own `undefined` key a parsed blob would not have. Stored data a change leaves failing the new schema is backfilled (the `backfills` skill).
- **Test object presence with a truthiness check, not `=== undefined`/`!== undefined`.** For an `Object | undefined` (or `| null`) value the absent form is falsy, so `result ? Promise.resolve(result) : fallback` and `if (!entity) return` read cleaner. Reserve explicit `=== undefined`/`=== null` for the value that could not have been given a sentinel in the first place: an index or a count where `0` is a real position, a measurement the browser hands back absent, a boundary row where `null` is the stored value. The test is whether a sentinel was available — if one was, it is taken and the comparison never appears, which is why an app-owned string never has one: `""` exists precisely so that `if (value)` is the whole check.

**External boundary — keep `null` where required:**

- **Drizzle ORM** — nullable columns infer as `T | null`, and so does an absent one-to-one relation loaded through `with` (`ResourceWithPublication.publication`); leave the boundary shape as-is and consume it at the call site (`??` onto a sentinel, truthiness guard) only where the app-owned shape is actually needed — there is no conversion layer. See `apps/web/content/docs/architecture/null-vs-undefined.md`.
- **`ItemMetadata.deletedAt`** (`@esposter/shared`) — `Date | null`, the soft-delete column Drizzle's metadata columns and Azure Table entities share, so every row of either satisfies it. An item stored inside a content blob is removed rather than soft deleted, so `AItemEntity` carries the timestamps without `deletedAt`, and a content schema names none.
- **Persisted JSON blobs** — `JSON.stringify` drops an `undefined` key outright, so a blob that must round-trip an empty slot stores `null`. `ColumnValue` is `boolean | null | number | string`: `null` is the empty spreadsheet cell, `""` a cell holding the empty string, and they sort, filter and count apart.
- **Azure SDK / EventGrid** — `SerializableValue`, EventGrid data shapes; keep raw types, convert on ingress.

**A tRPC read whose row is absent answers `undefined`** — never `?? null` on a `findFirst`, which only re-spells
the absence the query already returned.

**"Not loaded yet" is `isPending`, not a third value.** The one place the rule looks like it needs an exception is a
consumer that must tell "still loading" from "loaded, no row", since `useQuery` seeds `data` as
`undefined`. `useQuery` returns `isPending` beside `data` for exactly this, and it is true on the first render
because the read claims its key synchronously during setup — so the consumer gates on the flag and the read keeps
answering `undefined`:

```vue
<!-- WordFilter/Index.vue — renders once the read has answered, row or no row -->
<MessageModelRoomSettingsTypeWordFilterForm v-if="!isPending" :room-id="room.id" :filter />
```

When checking `null` at a boundary, use `=== null` (strict equality).
