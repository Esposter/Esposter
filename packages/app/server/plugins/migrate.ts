import { MIGRATIONS_FOLDER_PATH } from "@/server/db/constants";
import { migrate } from "drizzle-orm/postgres-js/migrator";
// @TODO: Make this async in nitro v3
export default defineNitroPlugin(() => {
  const db = useDb();
  void migrate(db, { migrationsFolder: MIGRATIONS_FOLDER_PATH });
});
