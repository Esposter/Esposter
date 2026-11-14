# Tasks

## 1.

- [x] 1.1 Convert every table under `packages/db-schema/src/schema` to SQLite with the column mapping in `design.md`, and the check-SQL helpers with them. Verified by `db:gen` producing a first migration for `core`.

## 2.

- [ ] 2.1 Build the D1 stream table client and its clause-to-SQL compiler, and rename `AzureTable`. Verified by the client's tests over Miniflare's D1.
- [ ] 2.2 Write `messages_search` with each message and read it in `searchMessages` and `readMySentMessages`. Verified by a sent message being found by search at once.

## 3.

- [ ] 3.1 Replace every `db.transaction` with a batch, a conditional statement or a constraint. Verified by no `transaction(` call remaining and the touched services' tests.
- [ ] 3.2 Rewrite the Postgres-only queries and the rate limiter's store. Verified by the touched services' tests.

## 4.

- [x] 4.1 Build `createMockDb` on Miniflare's D1 and delete `azure-mock` and PGlite. Verified by the database tests passing on it.
