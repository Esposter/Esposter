import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, integer, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const INVITE_ID_LENGTH = 8;
export const INVITE_ID_REGEX = new RegExp(String.raw`^[A-Za-z0-9]{${INVITE_ID_LENGTH}}$`, "u");

export const invitesInMessage = pgTable(
  "invites",
  {
    // Null = never expires
    expiresAt: timestamp(),
    id: text().primaryKey(),
    // Null = unlimited uses
    maxUses: integer(),
    roomId: uuid()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    uses: integer().notNull().default(0),
  },
  {
    extraConfig: ({ id, maxUses, uses }) => [
      check("invites_id_length_check", sql`LENGTH(${id}) = ${sql.raw(INVITE_ID_LENGTH.toString())}`),
      check("invites_max_uses_check", sql`${maxUses} IS NULL OR ${maxUses} > 0`),
      check("invites_uses_check", sql`${uses} >= 0`),
    ],
    schema: messageSchema,
  },
);

export type InviteInMessage = typeof invitesInMessage.$inferSelect;

export const selectInviteInMessageSchema = createSelectSchema(invitesInMessage, {
  id: (schema) => schema.length(INVITE_ID_LENGTH).regex(INVITE_ID_REGEX),
});
