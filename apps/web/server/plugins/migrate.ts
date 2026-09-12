import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { db } from "@@/server/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";
// A Nitro plugin is a synchronous slot the host neither awaits nor reports a rejection from, so the migration
// Is fired through the tracked wrapper that owns that shape (/docs/architecture/async-operations)
// @TODO: Remove getSynchronizedFunction in nitro v3, which awaits its plugins
export default defineNitroPlugin(
  getSynchronizedFunction(async () => {
    if (import.meta.prerender) return;

    await migrate(db, { migrationsFolder: "server/db/migrations" });
  }),
);
