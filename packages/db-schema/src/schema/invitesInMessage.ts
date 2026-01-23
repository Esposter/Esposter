import type { Room } from "@/schema/rooms";
import type { User } from "@/schema/users";
import type { UserToRoom } from "@/schema/usersToRooms";

import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { rooms } from "@/schema/rooms";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const CODE_LENGTH = 8;

export const invitesInMessage = pgTable(
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

export type InviteInMessage = typeof invitesInMessage.$inferSelect;

export const selectInviteInMessageSchema = createSelectSchema(invitesInMessage, {
  code: z.string().length(CODE_LENGTH),
});

// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const InviteInMessageRelations = {
  room: {
    with: {
      usersToRooms: true,
    },
  },
  user: true,
} as const;
export type InviteInMessageWithRelations = InviteInMessage & {
  room: Room & { usersToRooms: UserToRoom[] };
  user: User;
};
