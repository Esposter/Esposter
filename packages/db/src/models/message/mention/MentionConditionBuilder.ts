import type { Database } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

export type MentionConditionBuilder = (db: Database, roomId: string, ids: string[]) => Promise<SQL | undefined>;
