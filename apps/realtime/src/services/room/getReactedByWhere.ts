import { messageEmojisInRoom } from "@esposter/db-schema";
import { sql } from "drizzle-orm";

// The reactions a member is among the reactors of, matched in SQL so a read loads only their rows
export const getReactedByWhere = (userId: string) =>
  sql`exists (select 1 from json_each(${messageEmojisInRoom.userIds}) where json_each.value = ${userId})`;
