import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { messageSchema } from "#src/schema/message/messageSchema";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { sqliteTable } from "#src/sqliteTable";
import { index, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { v7 } from "uuid";
import { z } from "zod";

// A moderator's private note about a member of one room, visible only to the moderators of that room
export const moderationNotesInMessage = sqliteTable(
  "moderationNotes",
  {
    // The moderator who wrote the note. Null once their account is gone, since the note outlives its author
    actorUserId: text().references(() => usersInAuth.id, { onDelete: "set null" }),
    id: text()
      .primaryKey()
      .$defaultFn(() => v7()),
    note: text().notNull(),
    roomId: text()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    targetUserId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ actorUserId, id, roomId, targetUserId }) => [
      // A target's notes in a room page newest-first on id, which is creation order, and their badge counts the same rows
      index("moderationNotes_roomId_targetUserId_id_index").on(roomId, targetUserId, id),
      index("moderationNotes_actorUserId_index").on(actorUserId),
      index("moderationNotes_targetUserId_index").on(targetUserId),
    ],
    schema: messageSchema,
  },
);

export type ModerationNoteInMessage = typeof moderationNotesInMessage.$inferSelect;

export const selectModerationNoteInMessageSchema = createSelectSchema(moderationNotesInMessage, {
  actorUserId: (schema) => schema.nullable(),
  id: () => z.uuidv7(),
  roomId: () => z.uuidv7(),
});
