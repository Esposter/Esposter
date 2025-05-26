import type { PgliteDatabase } from "drizzle-orm/pglite";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { IS_PRODUCTION } from "#shared/util/environment/constants";
import { DrizzleLogger } from "@@/server/db/logger";
import { schema } from "@@/server/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const runtimeConfig = useRuntimeConfig();
const client = postgres(runtimeConfig.database.url);
// Add union type here to allow for mocks
export const useDb = (): PgliteDatabase<typeof schema> | PostgresJsDatabase<typeof schema> =>
  drizzle(client, {
    logger: IS_PRODUCTION ? undefined : new DrizzleLogger(),
    schema,
  });
