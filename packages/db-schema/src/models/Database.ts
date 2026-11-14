import type { relations } from "#src/generated/relations";
import type { DrizzleD1Database } from "drizzle-orm/d1";

// The one spelling of the drizzle handle: D1 in the Workers and Miniflare's D1 in tests, so both are the same type.
// It names the relations object because the v2 relational API resolves `db.query.*` from the relations
export type Database = DrizzleD1Database<typeof relations>;
