# D1 Writes

Read when a write is more than one statement, or when a read decides what a write does. The one-line rules are in `SKILL.md`; this page is their full statement.

D1 has no interactive transactions: nothing holds a transaction open across an `await`, so a `db.transaction(async (tx) => …)` callback is not a form to write on D1. Two forms replace it:

- **A multi-statement write is one `db.batch([...])`.** The statements are built first and passed as one array, and D1 applies the batch atomically: all of it, or none. The result is destructured by position, as `const [, reservedRows] = await db.batch([...])` does in `apps/web/server/services/storage/reserveStorageBytes.ts`.
- **A read-then-decide becomes one guarded statement.** A precondition about a row goes in the `WHERE` of an `UPDATE`, and the returned row says whether the claim held: no row means the claim is lost (`references/returning.md`, item 5). An insert that must not duplicate is an `INSERT … ON CONFLICT`, or a unique constraint on the table, so the losing write fails on the constraint rather than being checked for first.

A Durable Object's own SQLite is a different database. Its `transaction` runs synchronously inside the object, as `apps/functions/src/durableObjects/RoomObject.ts` uses it for a scheduled message, so this page is about D1.
