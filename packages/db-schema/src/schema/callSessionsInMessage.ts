import { createExactLengthCheckSql } from "#src/models/shared/Check";
import { pgTable } from "#src/pgTable";
import { messageSchema } from "#src/schema/messageSchema";
import { roomsInMessage } from "#src/schema/roomsInMessage";
import { users } from "#src/schema/users";
import { check, text, unique, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const CALL_ID_LENGTH = 12;
// Deliberately unanchored: the join form runs it over a pasted invite link to lift the code out of the middle
// Of a url. The schema below pairs it with an exact length, which is what anchors it where the id is the whole
// Input, so anchoring the pattern itself would only break the paste
export const CALL_ID_REGEX = new RegExp(String.raw`[A-Za-z0-9]{${CALL_ID_LENGTH}}`, "u");

export const callSessionsInMessage = pgTable(
  "callSessions",
  {
    id: text().primaryKey(),
    roomId: uuid().references(() => roomsInMessage.id, { onDelete: "cascade" }),
    // The thread this call belongs to, empty for the room's own call. A room can run both at once — a call in
    // A thread is a call about that message, not the room's — so the room alone does not identify a session
    threadRootRowKey: text().notNull().default(""),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
});
