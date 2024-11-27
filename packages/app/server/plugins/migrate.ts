import { useDb } from "@/server/util/useDb";
import { MIGRATIONS_FOLDER_PATH } from "@/shared/db/constants";
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
