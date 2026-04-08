import { pgTable } from "@/pgTable";
import { users } from "@/schema/users";
import { relations, sql } from "drizzle-orm";
import { check, index, pgEnum, text } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export enum FriendshipStatus {
  Accepted = "Accepted",
  Blocked = "Blocked",
  Pending = "Pending",
}

export const friendshipStatusSchema = z.enum(FriendshipStatus) satisfies z.ZodType<FriendshipStatus>;

export const friendshipStatusEnum = pgEnum("friendship_status", FriendshipStatus);

export const friends = pgTable(
  "friends",
  {
    // Natural key — sorted([senderId, receiverId]).join(ID_SEPARATOR).
    // Text PK: every lookup goes through this value, it never changes,
    // And there is exactly one row per user pair.
    id: text("id").primaryKey(),
    receiverId: text("receiverId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    senderId: text("senderId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: friendshipStatusEnum("status").notNull().default(FriendshipStatus.Pending),
  },
  {
    extraConfig: ({ receiverId, senderId }) => [
      check("no_self_friendship", sql`${senderId} != ${receiverId}`),
      index("friends_receiverId_idx").on(receiverId),
      index("friends_senderId_idx").on(senderId),
    ],
  },
);

export type Friend = typeof friends.$inferSelect;

export const selectFriendSchema = createSelectSchema(friends, {
  id: z.string().min(1),
});

export const friendsRelations = relations(friends, ({ one }) => ({
  receiver: one(users, {
    fields: [friends.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
  sender: one(users, {
    fields: [friends.senderId],
    references: [users.id],
    relationName: "sender",
  }),
}));
