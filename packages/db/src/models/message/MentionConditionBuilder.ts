import type { relations } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export type MentionConditionBuilder = (
  db: PostgresJsDatabase<typeof relations>,
  roomId: string,
  ids: string[],
) => Promise<SQL | undefined>;
