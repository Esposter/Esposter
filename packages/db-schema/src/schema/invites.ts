import type { Room } from "@/schema/rooms";
import type { User } from "@/schema/users";
import type { UserToRoom } from "@/schema/usersToRooms";

import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { rooms } from "@/schema/rooms";
import { users } from "@/schema/users";
import { relations, sql } from "drizzle-orm";
import { check, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const CODE_LENGTH = 8;

export const invites = pgTable(
  "invites",
  {
    code: text("code").notNull().unique(),
    id: uuid("id").primaryKey().defaultRandom(),
    roomId: uuid("roomId")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ code }) => [check("code", sql`LENGTH(${code}) = ${sql.raw(CODE_LENGTH.toString())}`)],
    schema: messageSchema,
  },
);

export type Invite = typeof invites.$inferSelect;

export const selectInviteSchema = createSelectSchema(invites, {
  code: z.string().length(CODE_LENGTH),
});

export const invitesRelations = relations(invites, ({ one }) => ({
  room: one(rooms, {
    fields: [invites.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [invites.userId],
    references: [users.id],
  }),
}));
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const InviteRelations = {
  room: {
    with: {
      usersToRooms: true,
    },
  },
  user: true,
} as const;
export type InviteWithRelations = Invite & { room: Room & { usersToRooms: UserToRoom[] }; user: User };
