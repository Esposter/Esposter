import { MIGRATIONS_FOLDER_PATH } from "#shared/db/constants";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { useDb } from "@@/server/composables/db/useDb";
import { migrate } from "drizzle-orm/postgres-js/migrator";
// @TODO: Remove getSynchronizedFunction in nitro v3
export default defineNitroPlugin(
  getSynchronizedFunction(async () => {
    const db = useDb();
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER_PATH });
  }),
);
