import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { boolean, check, pgEnum, text, timestamp } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const STATUS_MESSAGE_MAX_LENGTH = 1000;

export enum UserStatus {
  DoNotDisturb = "DoNotDisturb",
  Idle = "Idle",
  Offline = "Offline",
  Online = "Online",
}

const userStatusSchema = z.enum(UserStatus) satisfies z.ZodType<UserStatus>;

export const userStatusEnum = pgEnum("user_status", UserStatus);

export const userStatusesInMessage = pgTable(
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
export type UserStatusInMessage = typeof userStatusesInMessage.$inferSelect;

export const selectUserStatusInMessageSchema = createSelectSchema(userStatusesInMessage, {
  message: z.string().max(STATUS_MESSAGE_MAX_LENGTH),
  status: userStatusSchema.nullable(),
});
