import { DrizzleLogger } from "@@/server/db/logger";
import { schema } from "@esposter/db-schema";
import { getIsProduction } from "@esposter/shared";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, {
  logger: getIsProduction() ? undefined : new DrizzleLogger(),
  schema,
});
