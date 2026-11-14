# Registering Schema Exports

Read when adding a table or a relation part, or when a generated registry looks wrong.

**Nothing is registered by hand.** `pnpm registry:gen` (from `packages/db-schema/`, and run first by both `pnpm build` and `pnpm db:gen`) walks `src/schema/**` and `src/relations/**` and writes the two registries drizzle reads, `src/generated/schema.ts` and `src/generated/relations.ts`, unformatted like every generated file (`packages/db-schema/scripts/generateRegistry.ts`). A declaration is registered by existing: a table (`export const … = sqliteTable(`) and a relation part (`export const … = defineRelationsPart(`). An area's `createDatabaseSchema(` object is not registered; the table wrapper reads it. A generated file is never edited — a wrong entry is a wrong declaration or a wrong generator (`openspec/specs/architecture/generated-artifacts/design.md`).

What the registries feed:

- **`schema`** is what better-auth's drizzle adapter looks models up in (`apps/web/server/services/auth/drizzleAdapterConfiguration.ts`), and what `packages/db-schema/src/schema.test.ts` reads.
- **`relations`** is what puts a table on `db.query.*`: a table with no relation part is absent from the relational builder however it is registered in `schema`, and a read that wants the relational API gives the table its part first (`references/relations-v2.md`).
- From `packages/db-schema/`, **`pnpm db:gen`** reads the schema folders directly through `drizzle.config.ts`'s glob (`src/schema/**/*.ts`), so it sees exactly what the registry holds.

After a schema change, `pnpm build` in `packages/db-schema/` regenerates the registries.
