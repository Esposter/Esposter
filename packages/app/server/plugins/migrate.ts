import { MIGRATIONS_FOLDER_PATH } from "#shared/db/constants";
import { useDb } from "@@/server/composables/useDb";
import { migrate } from "drizzle-orm/postgres-js/migrator";

export default defineNitroPlugin(async () => {
  const db = useDb();
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER_PATH });
});
