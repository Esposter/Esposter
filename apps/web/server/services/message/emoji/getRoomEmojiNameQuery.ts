import type { Context } from "@@/server/trpc/context";
import type { RoomEmojiInMessage } from "@esposter/db-schema";

import { roomEmojisInMessage } from "@esposter/db-schema";
import { and, eq, ne } from "drizzle-orm";
// The room's other emoji answering to a name, as a subquery so the check and the update are one statement
export const getRoomEmojiNameQuery = (
  db: Context["db"],
  id: RoomEmojiInMessage["id"],
  name: RoomEmojiInMessage["name"],
  roomId: RoomEmojiInMessage["roomId"],
) =>
  db
    .select({ id: roomEmojisInMessage.id })
    .from(roomEmojisInMessage)
    .where(
      and(eq(roomEmojisInMessage.roomId, roomId), eq(roomEmojisInMessage.name, name), ne(roomEmojisInMessage.id, id)),
    );
