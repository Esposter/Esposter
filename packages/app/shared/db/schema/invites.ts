import type { Room } from "#shared/db/schema/rooms";
import type { User } from "#shared/db/schema/users";

import { pgTable } from "#shared/db/pgTable";
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
    roomId: text("roomId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  ({ code }) => [check("code", sql`LENGTH(${code}) = ${sql.raw(CODE_LENGTH.toString())}`)],
);

export type Invite = typeof invites.$inferSelect;
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const InviteRelations = {
  likes: true,
  user: true,
} as const;
export type InviteWithRelations = Invite & { Room: Room[]; user: User };

export const selectInviteSchema = createSelectSchema(invites, {
  code: z.string().length(CODE_LENGTH),
});

export const invitesRelations = relations(invites, ({ one }) => ({
  room: one(invites, {
    fields: [invites.roomId],
    references: [invites.id],
  }),
  user: one(users, {
    fields: [invites.userId],
    references: [users.id],
  }),
}));
