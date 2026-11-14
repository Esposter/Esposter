import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { messageSchema } from "#src/schema/message/messageSchema";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { sqliteTable } from "#src/sqliteTable";
import { index, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

// A moderator's private note about a member of one room, visible only to the moderators of that room
export const moderationNotesInMessage = sqliteTable(
  "moderationNotes",
  {
    // The moderator who wrote the note. Null once their account is gone, since the note outlives its author
    actorUserId: text().references(() => usersInAuth.id, { onDelete: "set null" }),
    id: text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    note: text().notNull(),
    roomId: text()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    targetUserId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ actorUserId, createdAt, id, roomId, targetUserId }) => [
      // A target's notes in a room page newest-first, and their badge counts the same rows: one index serves both
      index("moderationNotes_roomId_targetUserId_createdAt_id_index").on(roomId, targetUserId, createdAt, id),
      index("moderationNotes_actorUserId_index").on(actorUserId),
      index("moderationNotes_targetUserId_index").on(targetUserId),
    ],
    schema: messageSchema,
  },
);

export type ModerationNoteInMessage = typeof moderationNotesInMessage.$inferSelect;

export const selectModerationNoteInMessageSchema = createSelectSchema(moderationNotesInMessage, {
  actorUserId: (schema) => schema.nullable(),
  id: () => z.uuidv4(),
  roomId: () => z.uuidv4(),
});
