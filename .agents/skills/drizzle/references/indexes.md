# Indexes

Read when a query's filter or order needs an index, a count runs on a path every render pays for, or an index is added to a populated table. Constraint and index names are `references/table-constraints.md`.

## A count on a render path gets its own partial index

A composite index built for a list read (`{userId, createdAt DESC}`) answers a **count over a filtered subset**
badly: it is ordered for paging, so counting the matching rows walks the owner's whole history, and a history that
nothing purges only grows. Where that count sits on a path every render pays for — a badge in app chrome, a tab
label — add a partial index whose predicate is the filter, so the index is the size of the answer rather than the
size of the table:

```ts
extraConfig: ({ isRead, userId }) => [
  index("foos_userId_createdAt_index").on(userId, sql`"createdAt" DESC`),
  index("foos_userId_isRead_index").on(userId).where(sql`${isRead} = false`),
],
```

**Spell the predicate exactly as the query spells it** (`= false` against an `eq(column, false)` filter, not
`NOT column`): matching a differently-phrased predicate costs the planner an implication proof it may decline,
and a partial index the planner will not use is a write cost with no read benefit. The predicate's column joins
the index name, per the naming rule under "Naming".

This is not speculative tuning — it is the read pattern being known and fixed. A count whose subset is unbounded
(no filter, or a filter matching most rows) gets no partial index; it is already the composite index's job.

## An index follows the reads it serves, not the constraint it enforces

A primary key or unique constraint is one index ordered by its own columns, and it answers only a prefix of them. A
room-wide question (`WHERE "roomId" = ?`) over a key led by `userId` has no index at all, and every refresh of it scans
the whole table. The rule, applied to every table a read touches:

- **Lead each composite with the column the hottest reader filters on**, and add an index for any other filter a reader
  uses. `usersToRooms` keeps its primary key on `(userId, roomId)` for "this user's rooms", and gets
  `usersToRooms_roomId_index` for "this room's members".
- **Order the trailing columns by the read's `ORDER BY`**, with a `DISTINCT ON` key first, so the planner needs no sort:
  `usersToRoomRoles_roomId_userId_index` serves the top-role query's `DISTINCT ON (userId)`.
- **A foreign key gets no index in Postgres.** Index every foreign key whose parent's delete cascades through it, or whose
  children a read filters by: `posts_userId_ranking_index` serves an author's feed and the cascade of a user's deletion.
- **A composite that starts with a column another index already leads with is redundant.** Replace the single-column
  index rather than keep both; the composite answers its filter.

Adding a query means checking its filter and its order against the index list of each table it reads, in the same change.

## Index creation on a populated table

This repository's migrations run before any production data exists, so the generated `CREATE INDEX` is plain. Once a table
holds production rows, a plain `CREATE INDEX` takes a write lock for the length of the build, and the migration for that
index uses `CREATE INDEX CONCURRENTLY` (in a migration with no transaction) instead. Revisit this rule at the first
production migration.
