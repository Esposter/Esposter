import { AdminActionType } from "#src/models/message/AdminActionType";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { messageSchema } from "#src/schema/message/messageSchema";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { createEnumColumn } from "#src/services/shared/createEnumColumn";
import { sqliteTable } from "#src/sqliteTable";
import { index, integer, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { v7 } from "uuid";
import { z } from "zod";

// The moderation audit log: one row per admin action taken in a room, appended and never edited
export const moderationLogsInMessage = sqliteTable(
  "moderationLogs",
  {
    // The moderator who took the action, or the reserved AutoMod id for a word filter, which no account holds and so no
    // foreign key can name. Null once the moderator's account is deleted: the record stays for the room, without naming them
    actorUserId: text(),
    // Set for a timeout only, in milliseconds
    durationMs: integer(),
    id: text()
      .primaryKey()
      .$defaultFn(() => v7()),
    roomId: text()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    // The member the action was taken against. Their record goes with their account, as their ban does
    targetUserId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
    type: createEnumColumn(AdminActionType).notNull(),
  },
  {
    extraConfig: ({ actorUserId, id, roomId, targetUserId }) => [
      // A room's log pages newest-first on id, which is creation order, and its deletion cascades through it
      index("moderationLogs_roomId_id_index").on(roomId, id),
      // An archive reads the actions one person took, and the actions taken against them, across every room
      index("moderationLogs_actorUserId_index").on(actorUserId),
      index("moderationLogs_targetUserId_index").on(targetUserId),
    ],
    schema: messageSchema,
  },
);

export type ModerationLogInMessage = typeof moderationLogsInMessage.$inferSelect;

export const selectModerationLogInMessageSchema = createSelectSchema(moderationLogsInMessage, {
  durationMs: z.int().positive().nullable(),
  id: () => z.uuidv7(),
  roomId: () => z.uuidv7(),
});
