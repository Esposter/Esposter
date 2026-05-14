import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { sql } from "drizzle-orm";
import { check, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const CALL_ID_LENGTH = 12;
export const CALL_ID_REGEX = new RegExp(String.raw`[A-Za-z0-9]{${CALL_ID_LENGTH}}`, "u");

export const callSessionsInMessage = pgTable(
  "call_sessions",
  {
    id: text().primaryKey(),
    roomId: uuid()
      .unique()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ id }) => [
      check("call_sessions_id_length_check", sql`LENGTH(${id}) = ${sql.raw(CALL_ID_LENGTH.toString())}`),
    ],
    schema: messageSchema,
  },
);

export type CallSessionInMessage = typeof callSessionsInMessage.$inferSelect;

export const selectCallSessionInMessageSchema = createSelectSchema(callSessionsInMessage, {
  id: (schema) => schema.length(CALL_ID_LENGTH).regex(CALL_ID_REGEX),
});
