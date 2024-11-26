import { MIGRATIONS_FOLDER_PATH } from "@/server/db/constants";
import { useDb } from "@/server/util/useDb";
import { getSynchronizedFunction } from "@/shared/util/getSynchronizedFunction";
import { migrate } from "drizzle-orm/postgres-js/migrator";
// @TODO: Make this async in nitro v3
// https://github.com/nitrojs/nitro/issues/915
export default defineNitroPlugin(
  getSynchronizedFunction(async () => {
    const db = useDb();
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER_PATH });
  }),
);
