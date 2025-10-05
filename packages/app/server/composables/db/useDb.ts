import { IS_PRODUCTION } from "#shared/util/environment/constants";
import { DrizzleLogger } from "@@/server/db/logger";
import { schema } from "@@/server/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export const useDb = () => {
  const client = postgres(process.env.DATABASE_URL);
  return drizzle(client, {
    logger: IS_PRODUCTION ? undefined : new DrizzleLogger(),
    schema,
  });
};
