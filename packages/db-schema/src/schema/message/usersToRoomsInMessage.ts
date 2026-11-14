import { NotificationType, notificationTypeSchema } from "#src/models/message/NotificationType";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { messageSchema } from "#src/schema/message/messageSchema";
import { roomCategoriesInMessage } from "#src/schema/message/roomCategoriesInMessage";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { DISPLAY_NAME_MAX_LENGTH } from "#src/services/room/constants";
import { createEnumColumn } from "#src/services/shared/createEnumColumn";
import { createMaxLengthCheckSql } from "#src/services/shared/createMaxLengthCheckSql";
import { createMinimumCheckSql } from "#src/services/shared/createMinimumCheckSql";
import { sqliteTable } from "#src/sqliteTable";
import { createNormalizedStringSchema } from "@esposter/shared";
import { sql } from "drizzle-orm";
import { check, index, integer, primaryKey, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const usersToRoomsInMessage = sqliteTable(
  "usersToRooms",
  {
    // A category is its member's own, so the assignment is the member's too.
    // Each member files a room under their own category.
    // A category deleted by its owner leaves the membership uncategorized.
    categoryId: text().references(() => roomCategoriesInMessage.id, { onDelete: "set null" }),
    displayName: text().notNull().default(""),
    isHidden: integer({ mode: "boolean" }).notNull().default(false),
    lastMessageAt: integer({ mode: "timestamp_ms" }),
    lastReadAt: integer({ mode: "timestamp_ms" }),
    mentionCount: integer().notNull().default(0),
    notificationType: createEnumColumn(NotificationType).notNull().default(NotificationType.DirectMessage),
    roomId: text()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    timeoutUntil: integer({ mode: "timestamp_ms" }),
    userId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ categoryId, displayName, mentionCount, roomId, timeoutUntil, userId }) => [
      primaryKey({ columns: [userId, roomId] }),
      check("usersToRooms_displayName_length_check", createMaxLengthCheckSql(displayName, DISPLAY_NAME_MAX_LENGTH)),
      check("usersToRooms_mentionCount_check", createMinimumCheckSql(mentionCount, 0)),
      // The primary key leads with userId, so a room-wide question (its members, its member count) has no index of its
      // Own without this one
      index("usersToRooms_roomId_index").on(roomId),
      // A category deletion sets its members' rows null, so the foreign key is indexed by the rows that hold one
      index("usersToRooms_categoryId_index")
        .on(categoryId)
        .where(sql`${categoryId} IS NOT NULL`),
      index("usersToRooms_timeoutUntil_index")
        .on(timeoutUntil)
        .where(sql`${timeoutUntil} IS NOT NULL`),
    ],
    schema: messageSchema,
  },
);

export type UserToRoomInMessage = typeof usersToRoomsInMessage.$inferSelect;

export const selectUserToRoomInMessageSchema = createSelectSchema(usersToRoomsInMessage, {
  categoryId: () => z.uuidv4(),
  displayName: (schema) => createNormalizedStringSchema(DISPLAY_NAME_MAX_LENGTH, schema),
  mentionCount: (schema) => schema.nonnegative(),
  notificationType: notificationTypeSchema,
  roomId: () => z.uuidv4(),
});
