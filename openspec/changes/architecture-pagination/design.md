# One pagination — design

## Context

Three designs page the app's lists today. Twelve D1 reads take a keyset cursor over a `sortBy` the client sends (`createCursorPaginationParamsSchema`, `getCursorWhere`, `parseSortByToSql`); six take an offset (`createOffsetPaginationParamsSchema`); and the objects page their own way (the room object's `before`/`after` message ids, the user object's `{ createdAt, messageId, roomId }` sent-message cursor). An audit of every list found the costs: a sort over `likeCount` with no index, five reads accepting a sort no client sends, a search that accepts a sort it never applies, offset depth with no ceiling multiplied across every room a search names, a scheduled tab that skips a row whenever one above it runs, a cursor that fails as an internal error when it does not match its sort, a read that skips tied rows because its sort has no unique column, a search whose late page lands on the next query's list, and the page shapes declared as classes beside hand-written interfaces.

## Goals

- One wire shape, one cursor, one way to declare an order, one server helper set and one client store for every list.
- Every order is served by an index, never chosen freely by a client.
- A list that changes while it is read neither skips nor repeats.

## Decisions

### Keyset pagination only

Every list pages by keyset: the next page is the rows after the last row answered, in the list's order. **Rejected — offset pages for the numbered tables and the search:** an offset re-reads and discards every row before the page, has no depth ceiling of its own, and skips or repeats a row whenever the list changes above the page, which a live app's lists always do. A table pages forward and back with its cursors, as Stripe's and GitHub's API-backed tables do, and a total, where a surface shows one, is answered with the first page rather than derived from page numbers.

### The wire

The input is `{ cursor: string, limit: number }`, `cursor` defaulting to `""` (the start) and `limit` bounded by `MAX_READ_LIMIT`. The output is `{ items, nextCursor }` with `""` as the end, the app's absent string (the `absent-values` skill). `hasMore` is not on the wire: it is `Boolean(nextCursor)`, and two fields saying one thing can disagree. A read whose surface shows a total adds `count`, answered on the first page only. **Rejected — `nextCursor?: string`:** `""` is the app's one absent form for an owned string.

Both are declared once, in `packages/db-schema/src/models/pagination/`: `createPageInputSchema(sort)` (a read extends it with its own filters) and the `Page<TItem>` type. A sort's keys and direction are plain data both sides read, so the input schema parses the cursor for its sort at the boundary. Outputs are not parsed, so the output is a type, not a schema; no interface is written beside a schema anywhere.

### The order is the server's

A read declares its sort once, as data (`PageSort`: the keys it compares, in order, and one direction) beside its input schema, and the server binds each key to a column with `createPageSort(columns, sort)`. A sort key is a NOT NULL column, since a null never compares. The last key is unique — the row's id — so the order is total and ties never fall across a page boundary unordered. A list that offers a choice (the post feed's New and Top) takes the sort's name on the wire (`createSortedPageInputSchema`), mapped through one record to declared sorts, each matched by an index. **Rejected — a `SortItem[]` on the wire, checked against the table's columns:** it lets a client order by a column no index serves, it accepts keys no client sends, and a cursor carries whichever keys the client named, so a mismatched pair fails at read time. **Rejected — mixed directions within one sort:** a single direction compares as one SQLite row value, `(a, b, id) < (?, ?, ?)`, which one composite index serves; no list needs mixed directions.

### The cursor

The cursor is base64url of the JSON pair of its direction and the last answered row's sort values, in the sort's key order, a date as its millisecond number. It is opaque to the client and parsed at the boundary with Zod: an array of strings and numbers as long as the read's sort. A cursor that fails to parse, or whose length does not match the sort, is a bad request. **Rejected — a keyed object (today's `{ createdAt: ..., id: ... }`):** the keys restate the sort the server already knows. **Rejected — signing the cursor:** it names only values of rows the reader was already answered, and the read's own authorization still bounds the rows.

### One server helper set

`packages/db/src/services/pagination/` holds the helpers both D1 and the objects' SQLite use, since both are Drizzle over SQLite:

- `getPageWhere(sort, cursor)` — the row-value comparison, or no condition for `""`.
- `getPageOrderBy(sort)` — the order, ready for a relational or SQL-style query.
- `toPage(rows, sort, limit)` — a read asks for `limit + 1` rows; this slices the extra one off and encodes the cursor from the last row kept.
- `compareBySort(sort)` — the same order in JavaScript, for a read that merges several sources (the search across rooms, the scheduled tab across the user object and its rooms): each source answers `limit + 1` rows after the cursor, the page sorts the union with the comparator and hands it to `toPage`.

**Rejected — one generic `readPage(table, ...)` wrapper:** the reads are relational, SQL-style, joined and object-side; a wrapper would have to take every query shape, where three helpers compose with each.

### A computed order

A list ordered by something computed — search relevance — exposes it as a column of a subquery, and the sort names that column; the helpers do not care whether a column is stored.

### A list read both ways

The message list opens at a linked message and scrolls both ways. The cursor carries its direction: `toPage` encodes the direction it read in, and a read with a backward cursor answers the rows before the cursor's row, in list order, with a `nextCursor` that continues backward. An anchored read answers the items around a row with `{ items, nextCursor, previousCursor }`. It is the only variant, and it is the same cursor. **Rejected — `before` and `after` inputs beside `cursor`:** two inputs that may not both be set, and a second cursor format.

### One client store

`useCursorPaginationData` (and `useCursorPaginationDataMap` for per-key lists) holds every page, latest-wins: `readMoreItems` appends its page to the list it was read for, so a late page of a list a newer read replaced lands on the replaced list, never on its successor, and a reset still retires its list outright. A search keys its data by the query the read was issued for. A bidirectional list holds both cursors in the same store. `useOffsetPaginationData`, `OffsetPaginationData`, `BasePaginationData` and `CursorPaginationData` (classes) are deleted; the page is `Page<TItem>`.

## What is deleted

`isIncludeValue`, `SortItem` and `createSortItemSchema` on the wire, `createBasePaginationParamsSchema`, `createCursorPaginationParamsSchema`, `createOffsetPaginationParamsSchema`, the three `*PaginationParams` interfaces, `parseSortByToSql`, `getCursorWhere`, `getNextCursor`, `getCursorPaginationData`, `getBasePaginationData`, `serialize` and `deserialize`, `SORT_BY_MAX_LENGTH`, `CompositeKey` and `CompositeKeyPropertyNames`, `useOffsetPaginationData` and the page classes. No adapter keeps any of them working beside the new helpers.

## Key files

| File                                                             | Role                                                                                                                                    |
| :--------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/db-schema/src/models/pagination/Page.ts`               | `Page<TItem>`, the wire output                                                                                                          |
| `packages/db-schema/src/models/pagination/PageSort.ts`           | a declared sort: keys, columns and one direction                                                                                        |
| `packages/db/src/services/pagination/createPageSort.ts`          | declares a sort over a table's or a subquery's columns                                                                                  |
| `packages/db/src/services/pagination/getPageWhere.ts`            | the row-value comparison after a cursor                                                                                                 |
| `packages/db/src/services/pagination/getPageOrderBy.ts`          | the sort's order                                                                                                                        |
| `packages/db/src/services/pagination/toPage.ts`                  | the page and its cursor from `limit + 1` rows                                                                                           |
| `packages/db/src/services/pagination/compareBySort.ts`           | the sort's order in JavaScript, for merged sources                                                                                      |
| `packages/db-schema/src/models/pagination/PageInput.ts`          | `createPageInputSchema` and `createSortedPageInputSchema`: the cursor parsed for its sort at the boundary, a bad request when malformed |
| `packages/db-schema/src/services/pagination/encodePageCursor.ts` | the cursor on the wire                                                                                                                  |
| `apps/web/app/composables/data/pagination/cursor/`               | the one client store, latest-wins                                                                                                       |

## Playtest

None: the change reaches no player-facing Genshin surface.
