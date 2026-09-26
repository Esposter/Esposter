# Registering Schema Exports

Read when adding a table or a `pgEnum`, or when a migration fails with `type "…" does not exist`.

**Every schema export — tables AND `pgEnum`s — must be added to the `schema` object in `packages/db-schema/src/schema.ts`** (both the import and the object key, kept alphabetical). The object is the source drizzle-kit's `generateMigration` / `generateDrizzleJson` read, which feed `pnpm db:gen` and the db-mock snapshot generator. It is not what puts a table on `db.query.*`: the relational builder exposes the tables the `relations` object names, so a table with no relations part is absent from it however it is registered here, and a read that wants the relational API gives the table its part first (`references/relations-v2.md`). drizzle-kit only emits `CREATE TYPE` for `pgEnum`s present here, so a missing enum produces SQL referencing a type that is never created and fails at apply time with `type "..." does not exist`. The common trap is adding a second enum alongside an existing one and registering only the first.

After editing `schema.ts`, run `pnpm build` in `packages/db-schema/`, then `pnpm snapshot:gen` in `packages/db-mock/` — the generator runs under `tsx` without the `source` condition, so it reads the built `dist`, where tests and the typecheck read `src`.
