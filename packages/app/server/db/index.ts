import { MIGRATIONS_FOLDER_PATH } from "#shared/db/constants";
import { IS_PRODUCTION } from "#shared/util/environment/constants";
import { DrizzleLogger } from "@@/server/db/logger";
import { schema } from "@@/server/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const runtimeConfig = useRuntimeConfig();
const client = postgres(runtimeConfig.database.url);
export const db = drizzle(client, {
  logger: IS_PRODUCTION ? undefined : new DrizzleLogger(),
  schema,
});
await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER_PATH });
