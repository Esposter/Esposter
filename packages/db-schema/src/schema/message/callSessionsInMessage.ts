import type { ReverseTickedTimestamp } from "#src/models/azure/table/ReverseTickedTimestamp";

import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { messageSchema } from "#src/schema/message/messageSchema";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { CALL_ID_LENGTH, CALL_ID_REGEX } from "#src/services/message/call/constants";
import { createExactLengthCheckSql } from "#src/services/shared/createExactLengthCheckSql";
import { sqliteTable } from "#src/sqliteTable";
import { check, text, unique } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const callSessionsInMessage = sqliteTable(
  "callSessions",
  {
    id: text().primaryKey(),
    roomId: text().references(() => roomsInMessage.id, { onDelete: "cascade" }),
    // The thread this call belongs to, empty for the room's own call. A room can run both at once — a call in
    // A thread is a call about that message, not the room's — so the room alone does not identify a session
    threadRootRowKey: text().$type<"" | ReverseTickedTimestamp>().notNull().default(""),
    // The RealtimeKit meeting this call's participants join, made by its first join and never replaced. Null until that
    // join, and for a call joined where RealtimeKit is not configured. Unique, since a webhook names its call by it
    meetingId: text().unique(),
    userId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  {
    // One call per room and one per thread, rather than one per room: a standalone call carries no room at all,
    // And SQL treats each NULL room as distinct, so those stay unconstrained
    extraConfig: ({ id, roomId, threadRootRowKey }) => [
      check("callSessions_id_length_check", createExactLengthCheckSql(id, CALL_ID_LENGTH)),
      unique("callSessions_roomId_threadRootRowKey_unique").on(roomId, threadRootRowKey),
    ],
    schema: messageSchema,
  },
);

export type CallSessionInMessage = typeof callSessionsInMessage.$inferSelect;

export const selectCallSessionInMessageSchema = createSelectSchema(callSessionsInMessage, {
  id: (schema) => schema.length(CALL_ID_LENGTH).regex(CALL_ID_REGEX),
  roomId: () => z.uuidv4(),
});
