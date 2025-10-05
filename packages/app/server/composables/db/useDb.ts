import { IS_PRODUCTION } from "#shared/util/environment/constants";
import { DrizzleLogger } from "@@/server/db/logger";
import { schema } from "@@/server/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
// @TODO: Remove this import when nuxt fixes its types
import { useRuntimeConfig } from "nuxt/app";
import postgres from "postgres";

export const useDb = () => {
  const runtimeConfig = useRuntimeConfig();
  const client = postgres(runtimeConfig.database.url);
  return drizzle(client, {
    logger: IS_PRODUCTION ? undefined : new DrizzleLogger(),
    schema,
  });
};
