# Read endpoints, pagination inputs and `useRead*` composables

Read when writing a `read*` procedure, building its pagination input schema, or writing the `useRead*` composable that calls it. The client-side list/infinite-scroll layering belongs to the `pagination` skill.

## Pagination Params Schemas

Two factory functions in `shared/models/pagination/`:

- **`createCursorPaginationParamsSchema(sortKeySchema, defaultSortBy)`** — cursor-based; `minimumSortBy` hard-coded to `1` (needs a primary cursor key). `defaultSortBy` is typed `[SortItem<T>, ...SortItem<T>[]]` (non-empty tuple) — TS enforces ≥1 item matching the `min(1)` runtime constraint. Spread `.shape` into a `z.object({...})` and chain `.prefault({})` on the outer object for optional-input procedures.
- **`createOffsetPaginationParamsSchema(sortKeySchema, defaultSortBy?)`** — offset-based; `minimumSortBy` hard-coded to `0` (offset skips N rows without a stable sort key); `defaultSortBy` defaults to `[]`.

Both use `.prefault(defaultSortBy)` (not `.default()`) on `sortBy` — `prefault` applies the default _before_ inner validation, so the default array is itself validated against `.min(minimumSortBy)`. The `defaultSortBy` must satisfy the minimum.

**Never define `limit`/`cursor` manually.** The factories bake in `DEFAULT_READ_LIMIT`, `MAX_READ_LIMIT` and `cursor: z.string().default("")` — never override them. A parsed input therefore always carries a string, so the first page is `!cursor`, never `cursor === undefined`; `.optional()` here would also break the repo's "undefined banned as default — use `''`" rule. Non-cursor endpoints use `createBasePaginationParamsSchema`. When sort order is fixed, still pass a non-empty `defaultSortBy` (the factory's `min(1)` rejects `[]`), then omit `sortBy`: `createCursorPaginationParamsSchema(z.string(), [{ key: "rowKey", order: SortOrder.Desc }]).omit({ sortBy: true })`.

```ts
// CORRECT — cursor: non-empty defaultSortBy, .prefault({}) on outer object
const readRoomsInputSchema = z
  .object({
    ...createCursorPaginationParamsSchema(selectRoomInMessageSchema.keyof(), [
      { key: ItemMetadataPropertyNames.updatedAt, order: SortOrder.Desc },
    ]).shape,
  })
  .prefault({});

// CORRECT — offset: minimumSortBy=0, empty default is fine
const readSurveysInputSchema = createOffsetPaginationParamsSchema(selectSurveySchema.keyof()).prefault({});
```

Server-side, wire the cursor into `getCursorWhereAzureTable` (Azure Table) or `getCursorWhere` (Postgres), fetch `limit + 1` rows, and return `getCursorPaginationData(items, limit, sortBy)`:

```ts
const sortBy: SortItem<keyof ModerationLogEntity>[] = [MESSAGE_ROWKEY_SORT_ITEM];
if (cursor) clauses.push(...getCursorWhereAzureTable(cursor, sortBy));
const items = await getTopNEntities(client, limit + 1, ModerationLogEntity, { filter: serializeClauses(clauses) });
return getCursorPaginationData(items, limit, sortBy);
```

## Read endpoints must accept arrays (no N+1)

Every `read*` procedure that may be called for multiple items **must** accept an array of IDs, not a single ID:

```ts
// one request for N items; spread userIdsSchema (max baked in); chain .min(1) when required
export const readMemberRolesInputSchema = z.object({
  ...roomIdSchema.shape,
  userIds: userIdsSchema.shape.userIds.min(1),
});
```

Server: use `inArray(table.userId, userIds)` and include `userId` in the select so the client can group. Client: initialize all requested IDs to `[]` before grouping so users with no results are still set (clearing stale data):

```ts
const readMemberRoles = async (input: ReadMemberRolesInput) => {
  const memberRoles = await $trpc.role.readMemberRoles.query(input);
  const rolesByUserId = new Map<string, RoomRole[]>(input.userIds.map((userId) => [userId, []]));
  for (const { userId, ...role } of memberRoles) rolesByUserId.get(userId)?.push(role);
  for (const [userId, roles] of rolesByUserId) setDataMap(userId, roles);
};
```

## Metadata loading in `useRead*` composables

When a `useRead*` composable fetches a list, load all per-item metadata in a single `readMetadata` helper firing concurrently via `Promise.all`. Both the `readItems` and `readMoreItems` callbacks call the same `readMetadata` so logic is never duplicated.

```ts
const readMetadata = (memberIds: User["id"][]) => {
  if (!currentRoomId.value || memberIds.length === 0) return Promise.resolve();
  const roomId = currentRoomId.value;
  return Promise.all([readUserStatuses(memberIds), readMemberRoles({ roomId, userIds: memberIds })]);
};
```

- Capture reactive refs into a local `const` before `Promise.all` so all concurrent calls see the same value.
- Guard `memberIds.length === 0` to avoid unnecessary requests.
- Every call inside `Promise.all` must be a **single batch request** — never spread N individual calls (`...ids.map(...)`). If the endpoint accepts one ID, make it accept an array first.
