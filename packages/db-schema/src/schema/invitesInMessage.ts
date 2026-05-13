import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const INVITE_TOKEN_LENGTH = 8;

export const invitesInMessage = pgTable(
  "invites",
  {
    id: text().primaryKey(),
    roomId: uuid()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ id }) => [
      check("invites_id_length_check", sql`LENGTH(${id}) = ${sql.raw(INVITE_TOKEN_LENGTH.toString())}`),
    ],
    schema: messageSchema,
  },
);

export type InviteInMessage = typeof invitesInMessage.$inferSelect;

export const selectInviteInMessageSchema = createSelectSchema(invitesInMessage, {
  id: (schema) => schema.length(INVITE_TOKEN_LENGTH),
});
