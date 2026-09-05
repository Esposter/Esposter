import { AppNotificationType } from "#src/models/notification/AppNotificationType";
import { NotificationSeverity } from "#src/models/notification/NotificationSeverity";
import { pgTable } from "#src/pgTable";
import { users } from "#src/schema/users";
import { sql } from "drizzle-orm";
import { boolean, index, pgEnum, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const appNotificationTypeEnum = pgEnum("appNotificationType", AppNotificationType);

export const notificationSeverityEnum = pgEnum("notificationSeverity", NotificationSeverity);

// One row per recipient per notification, written by ProcessNotification for every type whose
// AppNotificationTypeChannelMap entry includes the bell. Persisted rather than session-scoped because a push delivered
// While the app was closed has nowhere else to land: the tab that would have held it in memory did not exist.
// The unread badge is a query against these rows, so a push payload never has to carry a count.
//
// Public schema, not messageSchema, for the same reason the subscriptions table is not in it: a resource
// Operation and a todo reminder are notifications with nothing message-shaped about them.
export const notifications = pgTable(
  "notifications",
  {
    body: text().notNull().default(""),
    id: uuid().primaryKey().defaultRandom(),
    isRead: boolean().notNull().default(false),
    // The in-app route the notification opens, and the same path the push payload deep-links to. Empty for a
    // Notification with nowhere to go rather than nullable, so a reader never branches on two kinds of absence
    path: text().notNull().default(""),
    severity: notificationSeverityEnum().notNull(),
    title: text().notNull(),
    type: appNotificationTypeEnum().notNull(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    // Every read of this table is the same shape — one user's own bell, newest first — so the index carries the
    // Order too and a page is a range scan rather than a scan plus a sort. `createdAt` comes from the metadata
    // Columns the pgTable wrapper adds, which are outside what extraConfig is handed, so it is named in SQL.
    //
    // The unread total is the second read, and the composite index is the wrong shape for it: it would scan one
    // User's whole history to count the unread rows in it, and that history only grows — nothing purges a
    // Notification once it is read. The partial index is the size of the answer instead, and the answer is what a
    // Bell shows. Its predicate is spelled exactly as the query's, so the planner needs no implication proof
    extraConfig: ({ isRead, userId }) => [
      index("notifications_userId_createdAt_index").on(userId, sql`"createdAt" DESC`),
      index("notifications_userId_isRead_index")
        .on(userId)
        .where(sql`${isRead} = false`),
    ],
  },
);

export type Notification = typeof notifications.$inferSelect;

export const selectNotificationSchema = createSelectSchema(notifications);
