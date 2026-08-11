# Generating and fixing migrations

Read when running `db:gen`, editing a generated `migration.sql`, or recovering a forked migration chain. The standing rules — `db:gen` is the only sanctioned generator, `snapshot.json` is never hand-cloned, don't run it as an unprompted side effect — are in `SKILL.md`.

## Running it

From `packages/db-schema/`:

```sh
pnpm db:gen   # generates snapshot.json + a first-cut migration.sql from the schema diff
pnpm db:up    # upgrades snapshot metadata to a newer drizzle-kit format — NOT an apply command
```

- `db:gen` reads `DATABASE_URL` only for config validation (the diff is schema-vs-snapshot, never the live DB) — inject it: `export DATABASE_URL="$(grep '^DATABASE_URL=' ../app/.env | cut -d= -f2-)"`.
- **Rename the generated codename folder** descriptively, keeping drizzle's timestamp prefix, then rerun `db:gen` — it must report `No schema changes, nothing to migrate`.
- Generation surfaces real drift a hand-written chain silently missed — e.g. enum values present in schema + code but never migrated. Verify against the live DB (`select enum_range(null::my_enum)`) before assuming a surprising diff is wrong.

## Renames — hint them, never hand-patch the drop

A rename is indistinguishable from a delete-plus-create in a schema diff, so drizzle-kit refuses to guess: it exits 2 and prints, per ambiguous entity, the two hint objects it would accept. Answer with `rename` and it emits `ALTER … RENAME`, which is metadata-only and keeps the data. This is strictly better than letting it generate a drop/recreate and rewriting the SQL afterwards — the SQL is right the first time and `snapshot.json` needs no thought.

```bash
pnpm db:gen --hints-file <path>.json    # a JSON array; --hints '<inline>' blows the Windows 8191-char limit
```

Each entry is `{ "type": "rename", "kind": "table" | "enum" | "check" | "index" | "unique", "from": [...], "to": [...] }`. `from` names the **previous** snapshot's identifier, `to` the new one — `[schema, name]` for a table or enum, `[schema, table, name]` for anything living on a table.

Two things that cost a cycle each if unknown:

- **Resolve in rounds.** A constraint or index on a table that is _also_ being renamed is not prompted until the table's own rename is known, so a second `db:gen` surfaces a fresh batch. Re-run until it writes the migration.
- **For those second-round entries, `from` takes the _new_ table name** with the _old_ constraint name. The table rename is applied first, so a `from` naming the old table matches nothing and fails with `doesn't match any deleted <kind>`.

Verify the result is what you asked for before renaming the folder — for a pure rename migration, every statement should be an `ALTER`, with no `DROP`, `TRUNCATE` or `DELETE` anywhere:

```bash
grep -cE "DROP|TRUNCATE|DELETE FROM" <migration>.sql   # expect 0
```

**Any** schema change — not just a rename — invalidates two derived artifacts that fail confusingly later: `packages/db-mock`'s pre-migrated PGlite snapshot (`pnpm snapshot:gen`, then `pnpm build`) and the bundle/type-size snapshots. The snapshot is built from the schema, not from the migrations, so a plain added column fails every server test with `column "x" of relation "y" does not exist` — and a rename fails them with `relation "x" does not exist`. Refresh size snapshots **after** the rebuild, or they capture the pre-build file.

## Fixing up the generated SQL

Editing the generated **`migration.sql`** by hand is allowed and expected — but only the SQL, and only before it's applied. The migrator's bookkeeping hash is `sha256(migration.sql)`, computed at apply time, so an un-applied `migration.sql` is free to edit; leave `snapshot.json` exactly as generated.

**Destructive diffs → rewrite the SQL to preserve data.** drizzle-kit emits drop/recreate where a data-preserving statement exists; an enum-value rename should be `ALTER TYPE "public"."foo_type" RENAME VALUE 'Bar' TO 'Baz';`, not `DROP TYPE` + `CREATE TYPE`. A value-order-only change generates a text-cast recreate (`SET DATA TYPE text` → `DROP TYPE` → `CREATE TYPE` → cast back). Postgres derives an enum's `ORDER BY`, `MIN`/`MAX` and `<`/`>` from its declared value order, so a recreate that reorders values silently changes those results — it is **not** harmless by default. Leave the recreate as-is only after confirming the enum is compared for equality only (never ordered on) and has no default; otherwise rewrite the SQL to preserve the declared value order.

## When drizzle-kit itself crashes

drizzle-kit's JSON parse for json/jsonb column defaults sits outside its try/catch, so a legacy default form in an old snapshot (`'{}'::jsonb`) can crash generation with a parse error. Normalize the offending snapshot's default to the plain form (`'{}'`) and rerun. In normal development this is the only sanctioned `snapshot.json` edit — a parser workaround, not a chain repair.

## Recovering a forked chain (maintainer-only)

Not part of any routine schema change. Back up the migrations folder first, then re-run `db:gen` to validate the result.

Prefer deleting the un-applied migration folders and regenerating from a correct head over hand-patching snapshots. If a repair is genuinely unavoidable, rewrite the stray branch's snapshots as cumulative state on the true head (union ddl entries keyed by `entityType|schema|table|name`, re-point `prevIds`).
