# Read endpoints, pagination inputs and `useRead*` composables

Read when writing a `read*` procedure, building its pagination input schema, or writing the `useRead*` composable that calls it. The client-side list/infinite-scroll layering belongs to `.agents/skills/pagination/references/cursor-pagination.md`.

## Pagination inputs

Two factories in `packages/db-schema/src/models/pagination/PageInput.ts` take a `PageSort`, `{ keys, order }`, whose last key is unique so the order is total:

- **`createPageInputSchema(sort)`** — a read whose order is fixed. Its input is `{ cursor, limit }`: the cursor is decoded for that sort at the boundary, and `limit` defaults to `DEFAULT_PAGE_LIMIT` and is capped at `MAX_READ_LIMIT`. Add filters with `.extend({...})`, and chain `.prefault({})` on the outer object for an optional input.
- **`createSortedPageInputSchema(sortNameSchema, sorts, defaultSortName)`** — a read where the caller names one of its own sorts. The input carries `sortName`, and the cursor is decoded for the sort it names. The client never sends an order, only the name of one.

**Never define `limit` or `cursor` by hand.** The factory owns both. On the wire the cursor is a string, and `""` is the first page; inside the procedure it is the decoded `PageCursor`, so the first page is `cursor.values.length === 0`. A read that is not paged takes no page input.

```ts
// The sort is a constant beside its input, with the unique id as its last key
export const NOTIFICATION_PAGE_SORT = { keys: ["id"], order: SortOrder.Desc } as const satisfies PageSort<"id">;
export const readNotificationsInputSchema = createPageInputSchema(NOTIFICATION_PAGE_SORT).prefault({});

// CORRECT — a fixed order, with filters added by extend beside the page
export const readBansInputSchema = createPageInputSchema(BAN_PAGE_SORT).extend({
  ...roomIdSchema.shape,
  filter: selectUserInAuthSchema.pick({ name: true }).optional(),
});
```

Server-side on **D1**, a paginated read is the `packages/db` helpers around the procedure's own query. `createPageSort(columns, sort)` binds each key to the column it compares, `getPageWhere` is the clause past the cursor and `getPageOrderBy` the order it reads in, the query reads `limit + 1` rows, and `toPage(rows, sort, cursor, limit)` answers `{ items, nextCursor }`, where the extra row is the whole answer to whether the list goes on. Never re-write the cursor clause or the page split inline. A first page also answers the list's total beside its rows, and a later page does not count again. The live example is `apps/web/server/trpc/routers/notification.ts`.

## Read endpoints must accept arrays (no N+1)

Every `read*` procedure that may be called for multiple items **must** accept an array of IDs, not a single ID:

```ts
// one request for N items; spread userIdsSchema (max baked in); chain .min(1) when required
export const readFooBarsInputSchema = z.object({ ...roomIdSchema.shape, userIds: userIdsSchema.shape.userIds.min(1) });
```

Server: use `inArray(table.userId, userIds)` and include `userId` in the select so the client can group. Client: initialize all requested IDs to `[]` before grouping so users with no results are still set (clearing stale data):

```ts
const readFooBars = async (input: ReadFooBarsInput) => {
  const fooBars = await $trpc.foo.readFooBars.query(input);
  const userIdFoosMap = new Map<string, Foo[]>(input.userIds.map((userId) => [userId, []]));
  for (const { userId, ...foo } of fooBars) userIdFoosMap.get(userId)?.push(foo);
  for (const [userId, foos] of userIdFoosMap) setData(userId, foos);
};
```

## Metadata loading in `useRead*` composables

When a `useRead*` composable fetches a list, load all per-item metadata in a single `readMetadata` helper firing concurrently via `Promise.all`. Both the `readItems` and `readMoreItems` callbacks call the same `readMetadata` so logic is never duplicated.

```ts
const readMetadata = (ids: Foo["id"][]) => {
  if (!currentParentId.value || ids.length === 0) return Promise.resolve();
  const parentId = currentParentId.value;
  return Promise.all([readBars(ids), readBazes({ ids, parentId })]);
};
```

- Capture reactive refs into a local `const` before `Promise.all` so all concurrent calls see the same value.
- Guard `ids.length === 0` to avoid unnecessary requests.
- Every call inside `Promise.all` must be a **single batch request** — never spread N individual calls (`...ids.map(...)`). If the endpoint accepts one ID, make it accept an array first.
