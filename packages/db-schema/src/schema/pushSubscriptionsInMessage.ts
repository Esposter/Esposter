import { pgTable } from "#src/pgTable";
import { messageSchema } from "#src/schema/messageSchema";
import { sessions } from "#src/schema/sessions";
import { users } from "#src/schema/users";
import { index, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const pushSubscriptionsInMessage = pgTable(
  "pushSubscriptions",
  {
    auth: text().notNull(),
    endpoint: text().notNull(),
    expirationTime: timestamp(),
    id: uuid().primaryKey().defaultRandom(),
    p256dh: text().notNull(),
    // A subscription belongs to the session that created it, not to the browser that once signed in, so the
    // Cascade is what makes a revoke, a sign-out and an expiry all stop that device's pushes without a cleanup
    // Path of their own — a subscription outliving its session still resolves and still delivers. Losing the row
    // Costs nothing: `usePushSubscription` resubscribes on mount, so the next authenticated load writes it again
    // Under the session actually in use
    sessionId: text()
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ endpoint, sessionId, userId }) => [
      unique("pushSubscriptions_endpoint_userId_unique").on(endpoint, userId),
      // The cascade reads this column on every session delete, which is every sign-out and every expiry sweep
      index("pushSubscriptions_sessionId_index").on(sessionId),
    ],
    schema: messageSchema,
  },
);
