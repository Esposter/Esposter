import type { User } from "@/schema/users";

import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { users } from "@/schema/users";
import { text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const pushSubscriptionsInMessage = pgTable(
  "push_subscriptions",
  {
    auth: text("auth").notNull(),
    endpoint: text("endpoint").notNull(),
    expirationTime: timestamp("expirationTime"),
    id: uuid("id").primaryKey().defaultRandom(),
    p256dh: text("p256dh").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ endpoint, userId }) => [unique("push_subscriptions_endpoint_userId_unique").on(endpoint, userId)],
    schema: messageSchema,
  },
);

export type PushSubscriptionInMessageEntity = typeof pushSubscriptionsInMessage.$inferSelect;

export const selectPushSubscriptionInMessageSchema = createSelectSchema(pushSubscriptionsInMessage, {
  endpoint: (schema) => schema.pipe(z.url()),
});

export type PushSubscriptionInMessageWithRelations = PushSubscriptionInMessageEntity & { user: User };
