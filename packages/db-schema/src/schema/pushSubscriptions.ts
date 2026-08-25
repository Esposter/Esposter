import { pgTable } from "#src/pgTable";
import { sessions } from "#src/schema/sessions";
import { users } from "#src/schema/users";
import { index, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

// Public schema rather than messageSchema: a row is per-session and per-user with nothing message-shaped about
// It, and every notification type — a resource operation, a todo reminder — resolves its devices through this
// Table. Filed under the message domain, none of them could reach it without importing that domain.
export const pushSubscriptions = pgTable(
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
      // Leading on userId so the constraint's own index also serves the lookup every delivery makes — the
      // Devices of a set of recipients. Ordered the other way it only answers "is this endpoint already
      // Registered for this user", and the delivery read falls back to a scan of every subscription in the system
      unique("pushSubscriptions_userId_endpoint_unique").on(userId, endpoint),
      // The cascade reads this column on every session delete, which is every sign-out and every expiry sweep
      index("pushSubscriptions_sessionId_index").on(sessionId),
    ],
  },
);
