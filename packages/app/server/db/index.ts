import { DrizzleLogger } from "@@/server/db/logger";
import { schema } from "@esposter/db-schema";
import { IS_PRODUCTION } from "@esposter/shared";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, {
  logger: IS_PRODUCTION ? undefined : new DrizzleLogger(),
  schema,
});
