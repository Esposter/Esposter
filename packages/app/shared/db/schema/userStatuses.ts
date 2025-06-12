import { users } from "#shared/db/schema/users";
import { UserStatus } from "#shared/models/db/user/UserStatus";
import { STATUS_MESSAGE_MAX_LENGTH } from "#shared/services/esbabbler/constants";
import { relations, sql } from "drizzle-orm";
import { check, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import z from "zod/v4";

export const userStatusEnum = pgEnum("user_status", UserStatus);

export const userStatuses = pgTable(
  "user_statuses",
  {
    expiresAt: timestamp("expiresAt"),
    lastActiveAt: timestamp("lastActiveAt").notNull().defaultNow(),
    message: text("message").notNull().default(""),
    // This is only used if the user manually sets a status
    status: userStatusEnum("status"),
    userId: text("userId")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  ({ message }) => [check("message", sql`LENGTH(${message}) <= ${sql.raw(STATUS_MESSAGE_MAX_LENGTH.toString())}`)],
);
export type IUserStatus = typeof userStatuses.$inferSelect;

export const selectUserStatusSchema = createSelectSchema(userStatuses, {
  message: z.string().max(STATUS_MESSAGE_MAX_LENGTH),
  status: z.enum(UserStatus).nullable(),
});

export const userStatusesRelations = relations(userStatuses, ({ one }) => ({
  user: one(users, {
    fields: [userStatuses.userId],
    references: [users.id],
  }),
}));
