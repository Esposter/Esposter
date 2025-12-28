import type { User } from "@/schema/users";

import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { users } from "@/schema/users";
import { relations } from "drizzle-orm";
import { text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    auth: text("auth").notNull(),
    endpoint: text("endpoint").notNull(),
    expirationTime: timestamp("expiration_time"),
    id: uuid("id").primaryKey().defaultRandom(),
    p256dh: text("p256dh").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ endpoint, userId }) => [unique().on(endpoint, userId)],
    schema: messageSchema,
  },
);

export type PushSubscriptionEntity = typeof pushSubscriptions.$inferSelect;

export const selectPushSubscriptionSchema = createSelectSchema(pushSubscriptions, {
  endpoint: z.url(),
});

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [pushSubscriptions.userId],
    references: [users.id],
  }),
}));

export type PushSubscriptionWithRelations = PushSubscriptionEntity & { user: User };
