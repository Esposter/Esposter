import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { db } from "@@/server/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";
// @TODO: Remove getSynchronizedFunction in nitro v3
export default defineNitroPlugin(
  getSynchronizedFunction(async () => {
    await migrate(db, { migrationsFolder: "server/db/migrations" });
  }),
);
