# The `""` String Sentinel

Read when typing, resetting or checking an app-owned string that may be empty — a ref, a store field, a route-derived id, a cursor, an entity field.

Prefer `string` with `""` as the absent/empty sentinel. Do not use `string | undefined` for any app-owned string value.

- **`ref<string>()` is banned** — always `ref("")` (`no-restricted-syntax`).
- **`useDataMap<string | undefined>(..., undefined)` is banned** — use `useDataMap(..., "")`.
- **`MaybeRefOrGetter<string | undefined>` is banned for currentId params** — always `MaybeRefOrGetter<string>`; internal `if (!currentIdValue)` guards handle `""`.
- **`cursor?: string` is banned** — always `cursor: string` with `z.string().default("")`; the server checks `if (cursor)` so `""` means no cursor.
- **`nextCursor = ""`** — `CursorPaginationData.nextCursor` is always `string`; `""` means no next page.
- **Resetting**: assign `""` not `undefined`. Never `value || undefined` before an API call — pass `""` directly.
- **`currentRoomId`** and similar route-derived IDs return `""` (not `undefined`) when absent.
- **Checking**: the truthy check is the _reason_ for the sentinel, not a style preference on top of it. `""` was chosen over `undefined` so that every absent-value test in the app is one shape — `if (value)` — with no union to narrow, no `?.` chain and no second falsy case to remember; a `value === ""` written back over it gives up that one shape and reintroduces two shapes per value. So never compare against the sentinel (`value === ""` / `value !== ""`) — use the truthy/falsy check directly: `if (value)`, `value ? a : b`, `.filter((line) => Boolean(line))`. Comparing to `""` survives only where falsy values diverge: `number | ""` unions (`0` is a real value, so `minimum !== ""` is load-bearing) and code that distinguishes `""` from `undefined` with different behavior for each (e.g. `image === ""` = clear it, `undefined` = leave unchanged).

**Legitimate exceptions (third-party boundaries only):** browser API properties genuinely optional with no default (e.g. `MediaRecorder.mimeType`); Vue Router param casts (`route.params.x as string | undefined` — normalise at the boundary, guard with `if (x)` immediately after); Node.js `req.socket.remoteAddress` and similar network properties.
