import { pgTable } from "#src/pgTable";
import { messageSchema } from "#src/schema/messageSchema";
import { users } from "#src/schema/users";
import { text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const pushSubscriptionsInMessage = pgTable(
  "pushSubscriptions",
  {
    auth: text().notNull(),
    endpoint: text().notNull(),
    expirationTime: timestamp(),
    id: uuid().primaryKey().defaultRandom(),
    p256dh: text().notNull(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ endpoint, userId }) => [unique("pushSubscriptions_endpoint_userId_unique").on(endpoint, userId)],
    schema: messageSchema,
  },
);
