# One pagination

## Why

Paginated reads are built three ways: a D1 keyset cursor over a sort the client chooses, offset pages, and the room object's own message ids and a sent-message cursor object. The client-chosen sort reaches columns no index serves, a cursor that does not match its sort fails as an internal error, offset depth has no ceiling and skips rows when a list changes under it, and the client pages each kind with its own store. Pagination is a solved problem, so every list in the app is served by one design and one set of code.

## What Changes

- **BREAKING** Every paginated read takes `{ cursor, limit }` and answers `{ items, nextCursor }`, with `""` as the end. `hasMore` is gone; a read with a total adds `count`.
- **BREAKING** The client no longer chooses an arbitrary sort. A read has one sort, declared on the server; a read that offers a choice takes an enum whose every member names an index-backed sort.
- **BREAKING** Offset pagination is removed: the resource tables, the message search and the scheduled tab page by cursor.
- A sort runs in one direction and ends in a unique column, and is compared as a SQLite row value, so ties never skip or repeat and one index serves the read.
- The cursor is an opaque, versionless token the server parses at the boundary; a malformed one is a bad request.
- One server helper set serves D1 and the Durable Objects' SQLite alike; one client store primitive serves every list, latest-wins.
- A list that is read both ways from a point (the message list jumping to a message) is the one variant: an anchored read answers a cursor in each direction.

## Capabilities

### New Capabilities

- `pagination`: how every list in the app is read a page at a time.

## Impact

Every procedure, room-object and user-object method that returns a page, and every client store that holds one. `isIncludeValue`, `SortItem` on the wire, `createOffsetPaginationParamsSchema`, `OffsetPaginationData`, `useOffsetPaginationData`, `CompositeKey`, `parseSortByToSql` over client input and the hand-written params interfaces are deleted.
