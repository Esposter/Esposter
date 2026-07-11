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
    // Null = never expires (timestamps have no empty value, unlike numbers/strings)
    expiresAt: timestamp(),
    id: text().primaryKey(),
    // 0 = unlimited uses — the numeric empty sentinel, stored as-is so it propagates end-to-end
    maxUses: integer().notNull().default(0),
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
      check("invites_max_uses_check", sql`${maxUses} >= 0`),
      check("invites_uses_check", sql`${uses} >= 0`),
      check("invites_uses_max_uses_check", sql`${maxUses} = 0 OR ${uses} <= ${maxUses}`),
    ],
    schema: messageSchema,
  },
);

export type InviteInMessage = typeof invitesInMessage.$inferSelect;

export const selectInviteInMessageSchema = createSelectSchema(invitesInMessage, {
  id: (schema) => schema.length(INVITE_ID_LENGTH).regex(INVITE_ID_REGEX),
});
