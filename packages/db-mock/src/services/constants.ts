import {
  CloudflareAssetType,
  CloudflareDatabaseRole,
  CloudflareEnvironment,
  getCloudflareResourceName,
} from "@esposter/db-schema";

// The binding names the Worker gives its two databases, the names its generated `wrangler.json` gives them in production
export const CORE_BINDING = "CORE";
export const STREAMS_BINDING = "STREAMS";
// The databases the development environment names them by, which a dev server's local D1 file is keyed on. The streams
// Database has no role in CloudflareDatabaseRole, so its purpose token is spelled here
export const CORE_DATABASE_NAME: string = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.D1Database,
  CloudflareDatabaseRole.Core,
);
export const STREAMS_DATABASE_NAME: string = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.D1Database,
  "streams",
);
// The compatibility date Miniflare runs the mock Worker under. It is a stand-in with no code of its own, so it only has
// To be a date the installed workerd accepts. Miniflare refuses a date later than the machine's clock, so a date long past,
// The one its own fallback uses, is the one every clock accepts
export const COMPATIBILITY_DATE = "2000-01-01";
// The table drizzle's D1 migrator writes its applied-migration ledger to, which a reset must leave alone
export const DRIZZLE_MIGRATIONS_TABLE = "__drizzle_migrations";
// The tables an FTS5 virtual table keeps beside itself, named `<table>_<suffix>`. A reset deletes from the virtual table,
// Which clears these too, and deleting from them directly would corrupt the index
export const FTS5_SHADOW_TABLE_SUFFIXES: string[] = ["config", "content", "data", "docsize", "idx"];
