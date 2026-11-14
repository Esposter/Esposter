// The binding names the Worker gives its two databases, the names its generated `wrangler.json` gives them in production
export const CORE_BINDING = "CORE";
export const STREAMS_BINDING = "STREAMS";
// The compatibility date Miniflare runs the mock Worker under. It is a stand-in with no code of its own, so it only
// Has to be a date the installed workerd accepts
export const COMPATIBILITY_DATE = "2026-10-01";
// The table drizzle's D1 migrator writes its applied-migration ledger to, which a reset must leave alone
export const DRIZZLE_MIGRATIONS_TABLE = "__drizzle_migrations";
// The tables an FTS5 virtual table keeps beside itself, named `<table>_<suffix>`. A reset deletes from the virtual table,
// which clears these too, and deleting from them directly would corrupt the index
export const FTS5_SHADOW_TABLE_SUFFIXES = ["config", "content", "data", "docsize", "idx"];
