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

## Fixing up the generated SQL

Editing the generated **`migration.sql`** by hand is allowed and expected — but only the SQL, and only before it's applied. The migrator's bookkeeping hash is `sha256(migration.sql)`, computed at apply time, so an un-applied `migration.sql` is free to edit; leave `snapshot.json` exactly as generated.

**Destructive diffs → rewrite the SQL to preserve data.** drizzle-kit emits drop/recreate where a data-preserving statement exists; an enum-value rename should be `ALTER TYPE "public"."foo_type" RENAME VALUE 'Bar' TO 'Baz';`, not `DROP TYPE` + `CREATE TYPE`. A value-order-only change generates a text-cast recreate (`SET DATA TYPE text` → `DROP TYPE` → `CREATE TYPE` → cast back). Postgres derives an enum's `ORDER BY`, `MIN`/`MAX` and `<`/`>` from its declared value order, so a recreate that reorders values silently changes those results — it is **not** harmless by default. Leave the recreate as-is only after confirming the enum is compared for equality only (never ordered on) and has no default; otherwise rewrite the SQL to preserve the declared value order.

## When drizzle-kit itself crashes

drizzle-kit's JSON parse for json/jsonb column defaults sits outside its try/catch, so a legacy default form in an old snapshot (`'{}'::jsonb`) can crash generation with a parse error. Normalize the offending snapshot's default to the plain form (`'{}'`) and rerun. In normal development this is the only sanctioned `snapshot.json` edit — a parser workaround, not a chain repair.

## Recovering a forked chain (maintainer-only)

Not part of any routine schema change. Back up the migrations folder first, then re-run `db:gen` to validate the result.

Prefer deleting the un-applied migration folders and regenerating from a correct head over hand-patching snapshots. If a repair is genuinely unavoidable, rewrite the stray branch's snapshots as cumulative state on the true head (union ddl entries keyed by `entityType|schema|table|name`, re-point `prevIds`).
