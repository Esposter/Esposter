import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { users } from "@/schema/users";
import { relations, sql } from "drizzle-orm";
import { boolean, check, pgEnum, text, timestamp } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const STATUS_MESSAGE_MAX_LENGTH = 1000;

export enum UserStatus {
  DoNotDisturb = "DoNotDisturb",
  Idle = "Idle",
  Offline = "Offline",
  Online = "Online",
}

export const userStatusEnum = pgEnum("user_status", UserStatus);

export const userStatuses = pgTable(
  "user_statuses",
  {
    expiresAt: timestamp("expiresAt"),
    isConnected: boolean("isConnected").notNull().default(true),
    message: text("message").notNull().default(""),
    // This is only used if the user manually sets a status
    status: userStatusEnum("status"),
    userId: text("userId")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ message }) => [
      check("message", sql`LENGTH(${message}) <= ${sql.raw(STATUS_MESSAGE_MAX_LENGTH.toString())}`),
    ],
    schema: messageSchema,
  },
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
