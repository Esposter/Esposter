import type { relations } from "@/relations";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

// The one spelling of the drizzle handle. It names the relations object rather than the schema object because
// The v2 relational API resolves `db.query.*` from the relations, so a handle typed without them loses every
// Relational read. The pglite handle db-mock builds is cast to this too — tests and production share one type.
export type Database = PostgresJsDatabase<typeof relations>;
