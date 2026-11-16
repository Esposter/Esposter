import { CloudflareCoreDatabaseIdMap, CloudflareEnvironment } from "@esposter/db-schema";

// The binding name the Worker gives its database, the name its generated `wrangler.json` gives it in production
export const CORE_BINDING = "CORE";
// The development database's id, which a dev server's local D1 file is keyed on: wrangler names the local file by the
// Binding's database_id, so the dev seed reopens the same file
export const CORE_DATABASE_ID: string = CloudflareCoreDatabaseIdMap[CloudflareEnvironment.Development];
// The table drizzle's D1 migrator writes its applied-migration ledger to, which a reset must leave alone
export const DRIZZLE_MIGRATIONS_TABLE = "__drizzle_migrations";
// The tables an FTS5 virtual table keeps beside itself, named `<table>_<suffix>`. A reset deletes from the virtual table,
// Which clears these too, and deleting from them directly would corrupt the index
export const FTS5_SHADOW_TABLE_SUFFIXES: string[] = ["config", "content", "data", "docsize", "idx"];
