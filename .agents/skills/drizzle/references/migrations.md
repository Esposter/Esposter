# Generating and fixing migrations

Read when running `db:gen`, editing a generated `migration.sql`, or recovering a forked migration chain. The standing rules — `db:gen` is the only sanctioned generator, `snapshot.json` is never hand-cloned, don't run it as an unprompted side effect — are in `SKILL.md`.

## Why the snapshot is never hand-cloned

Copying a previous snapshot and bumping `id`/`prevIds` by hand forks the chain the instant two migrations descend from the same parent, and the next `db:gen` fails with `Non-commutative migrations detected`.

## Running it

From `packages/db-schema/`:

```sh
pnpm db:gen   # generates snapshot.json + a first-cut migration.sql from the schema diff
pnpm db:up    # upgrades snapshot metadata to a newer drizzle-kit format, never an apply command
```

- `db:gen` reads no environment variable and no database: the diff is schema-vs-snapshot, never the live D1 database.
- **Rename the generated codename folder** descriptively, keeping drizzle's timestamp prefix, then rerun `db:gen` — it must report `No schema changes, nothing to migrate`.
- Generation surfaces real drift a hand-written chain silently missed. Check a surprising diff against the migrations folder before calling it wrong.
- **Applying** goes to the `core` D1 database through `pnpm --filter @esposter/db-schema db:migrate`, which uses D1's HTTP API. Local development applies the same folder with `wrangler d1 migrations apply CORE --local`, which `apps/web`'s `predev` runs.

## One generation at a time

Two `db:gen` runs in parallel descend from the same parent snapshot and fork the chain, so when several sessions work at once, one generates at a time.

## Renames — hint them, never hand-patch the drop

A rename is indistinguishable from a delete-plus-create in a schema diff, so drizzle-kit refuses to guess: it exits 2 and prints, per ambiguous entity, the hint it would accept. Answer with `rename` and it writes `ALTER TABLE … RENAME TO` or `ALTER TABLE … RENAME COLUMN`, which keeps the rows. That is better than a drop and a copy rewritten afterwards — the SQL is right the first time and `snapshot.json` needs no thought.

```bash
pnpm db:gen --hints-file <path>.json    # a JSON array; --hints '<inline>' blows the Windows 8191-char limit
```

Each entry is `{ "type": "rename", "kind": "table" | "column", "from": [...], "to": [...] }`. `from` names the **previous** snapshot's identifier, `to` the new one.

Verify the result is what you asked for before renaming the folder. A pure rename migration holds `ALTER TABLE` statements and nothing that drops or deletes rows:

```bash
grep -cE "DROP TABLE|DELETE FROM" <migration>.sql   # expect 0
```

## Schema changes rebuild tables

SQLite cannot alter most of a column, so drizzle-kit rebuilds the table for a change to a column or a constraint: `PRAGMA foreign_keys=OFF`, a `__new_` table, an `INSERT … SELECT` copy, `DROP TABLE`, `ALTER TABLE … RENAME TO`, `PRAGMA foreign_keys=ON`.

The bundles the size tests read grow with a schema change wherever `@esposter/db-schema` is inlined. The bundle-size record that growth moves is regenerated with `pnpm bundle-sizes:gen` only after the rebuild, as `build`'s `references/dist-size.md` sets out. `@esposter/db-mock` applies the migration folders on every `createMockDb`, so no snapshot goes stale.

## Fixing up the generated SQL

Editing the generated **`migration.sql`** by hand is allowed and expected — but only the SQL, and only before it's applied. The migrator's bookkeeping hash is `sha256(migration.sql)`, computed at apply time, so an un-applied `migration.sql` is free to edit; leave `snapshot.json` exactly as generated.

**A backfill runs under the constraint the migration has not replaced yet.** drizzle-kit groups its statements by column, so a column whose CHECK is being relaxed gets its `UPDATE` while the outgoing one is still live — backfilling `NULL` to a `0` sentinel under `… IS NULL OR … >= 1` fails on the first row it was written for. Swap the constraints first, then backfill: a CHECK is unknown rather than false on a `NULL`, so the incoming one admits the rows the backfill has yet to reach. Nothing here catches it — the diff is against the snapshot rather than data, and a database with no such row applies the wrong order green, which is every database a test starts from.

**A rebuild copies only the columns its `INSERT … SELECT` names.** A column the copy leaves out loses its data, so read the copy before the migration is applied.

## A new reference over existing rows

A referencing column that a pre-existing row cannot fill is settled in the migration, never by leaving the reference off: **delete those rows or backfill them with a real parent id**, whichever the domain can justify. An empty sentinel is not available to a foreign key — no row has that id, so the constraint rejects every one of them and the migration fails. Deleting is the cheap answer wherever the row is rebuilt by its own client on next use, and the migration says which it is.

## Recovering a forked chain (maintainer-only)

Not part of any routine schema change. Back up the migrations folder first, then re-run `db:gen` to validate the result.

Prefer deleting the un-applied migration folders and regenerating from a correct head over hand-patching snapshots. If a repair is genuinely unavoidable, rewrite the stray branch's snapshots as cumulative state on the true head (union ddl entries keyed by `entityType|schema|table|name`, re-point `prevIds`).
