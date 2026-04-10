import { pgTable } from "@/pgTable";
import { type User, users } from "@/schema/users";
import { relations, sql } from "drizzle-orm";
import { check, index, text } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const friendRequests = pgTable(
  "friend_requests",
  {
    // Natural key — sorted([senderId, receiverId]).join(ID_SEPARATOR).
    // Conflicts on insert act as idempotency: if A already sent to B, a second send is a no-op.
    id: text("id").primaryKey(),
    receiverId: text("receiverId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    senderId: text("senderId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ receiverId, senderId }) => [
      check("no_self_friend_request", sql`${senderId} != ${receiverId}`),
      index("friend_requests_receiverId_idx").on(receiverId),
      index("friend_requests_senderId_idx").on(senderId),
    ],
  },
);

export type FriendRequest = typeof friendRequests.$inferSelect;
export type FriendRequestWithRelations = FriendRequest & { receiver: User; sender: User };

export const selectFriendRequestSchema = createSelectSchema(friendRequests, {
  id: z.string().min(1),
});

export const friendRequestsRelations = relations(friendRequests, ({ one }) => ({
  receiver: one(users, {
    fields: [friendRequests.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
  sender: one(users, {
    fields: [friendRequests.senderId],
    references: [users.id],
    relationName: "sender",
  }),
}));
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const FriendRequestRelations = {
  receiver: true,
  sender: true,
} as const;
