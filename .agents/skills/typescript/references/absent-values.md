# Absent Values — the `""` Sentinel, `null` vs `undefined`

## `string` — always `""` as the empty sentinel

Prefer `string` with `""` as the absent/empty sentinel. Do not use `string | undefined` for any app-owned string value.

- **`ref<string>()` is BANNED** — always `ref("")`.
- **`useDataMap<string | undefined>(..., undefined)` is BANNED** — use `useDataMap(..., "")`.
- **`MaybeRefOrGetter<string | undefined>` is BANNED for currentId params** — always `MaybeRefOrGetter<string>`; internal `if (!currentIdValue)` guards handle `""`.
- **`cursor?: string` is BANNED** — always `cursor: string` with `z.string().default("")`; the server checks `if (cursor)` so `""` means no cursor.
- **`nextCursor = ""`** — `CursorPaginationData.nextCursor` is always `string`; `""` means no next page.
- **Resetting**: assign `""` not `undefined`. Never `value || undefined` before an API call — pass `""` directly.
- **`currentRoomId`** and similar route-derived IDs return `""` (not `undefined`) when absent.
- **Checking**: the truthy check is the _reason_ for the sentinel, not a style preference on top of it. `""` was chosen over `undefined` so that every absent-value test in the app is one shape — `if (value)` — with no union to narrow, no `?.` chain and no second falsy case to remember; a `value === ""` written back over it gives up everything the migration bought and reintroduces the two-shapes-per-value problem. So never compare against the sentinel (`value === ""` / `value !== ""`) — use the truthy/falsy check directly: `if (value)`, `value ? a : b`, `.filter((line) => Boolean(line))`. Comparing to `""` survives ONLY where falsy values diverge: `number | ""` unions (`0` is a real value, so `minimum !== ""` is load-bearing) and code that distinguishes `""` from `undefined` with different behavior for each (e.g. `image === ""` = clear it, `undefined` = leave unchanged).

**Legitimate exceptions (third-party boundaries only):** browser API properties genuinely optional with no default (e.g. `MediaRecorder.mimeType`); Vue Router param casts (`route.params.x as string | undefined` — normalise at the boundary, guard with `if (x)` immediately after); Node.js `req.socket.remoteAddress` and similar network properties.

## Sentinels propagate end-to-end

A client ref seeded with its sentinel (`""`, `0`, first enum value) always sends the field, so the API input declares it **required** with the sentinel in its value space — never `.partial()`/`.optional()`/`.default()` machinery or `?? undefined` normalisation at the call site. The server truthiness-guards (`if (type) ...`). Minimal code: one value space from ref to query.

- Plain `string` fields already contain `""` — reuse the source schema untouched: `entitySchema.pick({ actorUserId: true })`, non-partial.
- Enum fields union the sentinel: `type: entitySchema.shape.type.or(z.literal(""))`.
- **Numbers use `0`** when `0` has no domain meaning — invite `expireAfterMinutes`/`maxUses`: `0` = never expires / unlimited (`z.literal([...OPTIONS, 0])`, never `.nullable()`).
- **The DB schema itself carries the sentinel** so it flows ref → input → row → read untouched — the column-level rules are the `drizzle` skill's.
- Reserve `.default("")` for fields genuinely omitted by some callers (e.g. `cursor` on the first page request).

## `null` vs `undefined`

`undefined` is **banned in app-owned code unless it carries a meaning distinct from every real value** — including the `""` string sentinel and an absent optional property. Only reach for it when absence must be told apart from a valid value (e.g. a cache read where a stored `""` is real and `undefined` means "miss"). `null` is only permitted at the external system boundary — every `null` in the repo belongs to one of the shapes listed below, and a type keeping one names the boundary it came from.

**App-owned code — prefer absence over an explicit `undefined`:**

- String refs use `ref("")`, not `ref<string>()`.
- Optional interface fields use `?:` (implies `| undefined`), not `| null`.
- **A property whose absent form is `undefined` must be declared `field?: T`, never `field: T | undefined`** — `no-restricted-syntax` in `packages/configuration/eslint/typescriptRules.js` (covers interface/type-literal members, class fields, and `defineProps` interfaces in `.vue`). Non-property positions — parameters, return types, generic arguments, array/tuple members — keep `| undefined`, since `?:` can't express them.
- **Never synthesize an explicit `undefined` value.** Model absence as the _missing optional key_, not `{ key: undefined }` — build the object conditionally (`environment ? { backend, environment } : { backend }`) so no `undefined` literal is ever written, and tests `toStrictEqual({ backend })` rather than `{ backend, key: undefined }`.
- Uninitialised state, optional params and absent returns lean on `""`/omission; add `| undefined` to a type **only** when the distinct-from-`""` rule above applies.
- Never `?? null` — if the left side is already `T | undefined`, drop the fallback.
- `.nullable()` is **BANNED** in app-owned Zod schemas — use `.optional()`.
- **Test object presence with a truthiness check, not `=== undefined`/`!== undefined`.** For an `Object | undefined` (or `| null`) value the absent form is falsy, so `result ? Promise.resolve(result) : fallback` and `if (!entity) return` read cleaner. Reserve explicit `=== undefined`/`=== null` for the value that could not have been given a sentinel in the first place: an index or a count where `0` is a real position, a measurement the browser hands back absent, a boundary row where `null` is the stored value. The test is whether a sentinel was available — if one was, it is taken and the comparison never appears, which is why an app-owned string never has one: `""` exists precisely so that `if (value)` is the whole check.
- Enums never get a `None` member for "absent" — see `references/enums.md`.

**External boundary — keep `null` where required:**

- **Drizzle ORM** — nullable columns infer as `T | null`, and so does an absent one-to-one relation loaded through `with` (`ResourceWithPublication.publication`); leave the boundary shape as-is and consume it at the call site (`??` onto a sentinel, truthiness guard) only where the app-owned shape is actually needed — there is no conversion layer. See `apps/web/content/docs/architecture/null-vs-undefined.md`.
- **Persisted JSON blobs** — `JSON.stringify` drops an `undefined` key outright, so a blob that must round-trip an empty slot stores `null`. `ColumnValue` is `boolean | null | number | string`: `null` is the empty spreadsheet cell, `""` a cell holding the empty string, and they sort, filter and count apart.
- **Azure SDK / EventGrid** — `SerializableValue`, EventGrid data shapes; keep raw types, convert on ingress.
- **Vuetify** — a few Vuetify props are typed `T | null`; use `null` only where the prop type requires it, with a comment explaining why.

**A tRPC read whose row is absent answers `undefined`** — never `?? null` on a `findFirst`, which only re-spells
the absence the query already returned.

**"Not loaded yet" is `isPending`, not a third value.** The one place the rule looks like it needs an exception is a
consumer that must tell "still loading" from "loaded, and there is no row", since `useQuery` seeds `data` as
`undefined`. `useQuery` returns `isPending` beside `data` for exactly this, and it is true on the first render
because the read claims its key synchronously during setup — so the consumer gates on the flag and the read keeps
answering `undefined`:

```vue
<!-- WordFilter/Index.vue — renders once the read has answered, row or no row -->
<MessageModelRoomSettingsTypeWordFilterForm v-if="!isPending" :room-id="room.id" :filter />
```

When checking `null` at a boundary, use `=== null` (strict equality).
