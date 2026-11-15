# Tasks

## 1.

- [x] 1.1 Convert every table under `packages/db-schema/src/schema` to SQLite with the column mapping in `design.md`, and the check-SQL helpers with them. Verified by `db:gen` producing a first migration for `core`.

## 2.

- [x] 2.2 Write `messages_search` in the room's object with each message and read it in its `searchMessages`; `readMySentMessages` reads the user object's sent index. Verified by the room object's test finding a sent message by search at once.

## 3.

- [x] 3.1 Replace every D1 `db.transaction` with a batch, a conditional statement or a constraint; an object's own SQLite keeps its synchronous transactions. Verified by no `transaction(` call on D1 remaining and the touched services' tests.
- [x] 3.2 Rewrite the Postgres-only queries and the rate limiter's store. Verified by no Postgres-only operator or type remaining outside the cutover and the D1 suites of the touched services.

## 4.

- [x] 4.1 Build `createMockDb` on Miniflare's D1 and delete `azure-mock` and PGlite. Verified by the database tests passing on it.
