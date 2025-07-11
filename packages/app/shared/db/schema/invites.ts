import type { Room } from "#shared/db/schema/rooms";
import type { User } from "#shared/db/schema/users";
import type { UserToRoom } from "#shared/db/schema/usersToRooms";

import { pgTable } from "#shared/db/pgTable";
import { rooms } from "#shared/db/schema/rooms";
import { users } from "#shared/db/schema/users";
import { CODE_LENGTH } from "#shared/services/invite/constants";
import { relations, sql } from "drizzle-orm";
import { check, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

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
  ({ code }) => [check("code", sql`LENGTH(${code}) = ${sql.raw(CODE_LENGTH.toString())}`)],
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
