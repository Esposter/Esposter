# Registering Schema Exports

Read when adding a table, a `pgEnum`, a Postgres schema or a relation part, or when a migration fails on a missing type or schema.

**Nothing is registered by hand.** `pnpm registry:gen` (from `packages/db-schema/`, and run first by both `pnpm build` and `pnpm db:gen`) walks `src/schema/**` and `src/relations/**` and writes the two registries drizzle reads, `src/generated/schema.ts` and `src/generated/relations.ts`, unformatted like every generated file (`packages/db-schema/scripts/generateRegistry.ts`). A declaration is registered by existing: a table (`export const … = pgTable(`), an enum (`… = <schema>Schema.enum(`), a Postgres schema (`… = camelCase.schema(`) and a relation part (`… = defineRelationsPart(`). A generated file is never edited — a wrong entry is a wrong declaration or a wrong generator (`apps/web/content/docs/architecture/generated-artifacts.md`).

What the registries feed:

- **`schema`** is what drizzle-kit's `generateDrizzleJson` / `generateMigration` read for the db-mock snapshot, and what better-auth's adapter looks models up in. drizzle-kit emits `CREATE SCHEMA` and `CREATE TYPE` only for what it holds, which is why the Postgres schema objects are registered beside the tables — a table in an unregistered schema fails at apply time with `schema "…" does not exist`.
- **`relations`** is what puts a table on `db.query.*`: a table with no relation part is absent from the relational builder however it is registered in `schema`, and a read that wants the relational API gives the table its part first (`references/relations-v2.md`).
- **`pnpm db:gen`** reads the schema folders directly through `drizzle.config.ts`'s glob, so it sees exactly what the registry holds.

After a schema change, `pnpm build` in `packages/db-schema/`, then `pnpm snapshot:gen` in `packages/db-mock/` — the snapshot generator runs without the `source` condition, so it reads the built `dist`, where tests and the typecheck read `src`.
