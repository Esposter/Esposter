import type { relations } from "#src/relations";
import type { PgAsyncDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

// The one spelling of the drizzle handle. It names the relations object rather than the schema object because
// The v2 relational API resolves `db.query.*` from the relations, so a handle typed without them loses every
// Relational read. It is the driver-agnostic base every pg driver's handle extends, so the postgres-js handle
// The apps build and the pglite handle db-mock builds both satisfy it as they are — nothing needs a cast
export type Database = PgAsyncDatabase<PgQueryResultHKT, typeof relations>;
