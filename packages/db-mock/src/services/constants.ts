import { CloudflareCoreDatabaseIdMap, CloudflareEnvironment } from "@esposter/db-schema";
import { tmpdir } from "node:os";
import { join } from "node:path";

// The binding name the Worker gives its database, the name its generated `wrangler.json` gives it in production
export const CORE_BINDING = "CORE";
// The development database's id, which a dev server's local D1 file is keyed on: wrangler names the local file by the
// Binding's database_id, so the dev seed reopens the same file
export const CORE_DATABASE_ID: string = CloudflareCoreDatabaseIdMap[CloudflareEnvironment.Development];
// The table drizzle's D1 migrator writes its applied-migration ledger to, which a reset must leave alone
export const DRIZZLE_MIGRATIONS_TABLE = "__drizzle_migrations";
// The tables an FTS5 virtual table keeps beside itself, named `<table>_<suffix>`. A reset deletes from the virtual
// Table, which clears these too, and deleting from them directly would corrupt the index
export const FTS5_SHADOW_TABLE_SUFFIXES: string[] = ["config", "content", "data", "docsize", "idx"];

// Applying the migrations is most of a file's fixed cost: each statement crosses Miniflare's binding one call at a
// Time, so every file paid the whole folder again. The migrated state is the same for every file, so the first one
// Builds it once into a folder named by its key, and every file copies that folder into a persistence root of its own,
// Where the migrator finds every migration already applied. A copy is the file's own, so no file's writes reach another
export const TEMPLATE_ROOT = join(tmpdir(), "db-mock-templates");
// A copy is named by the process that made it, so the process id is read back from its name
export const COPY_REGEX = /^copy-(?<processId>\d+)-/u;
