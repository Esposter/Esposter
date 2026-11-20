import type { Context } from "#server/trpc/context";
import type { RoomEmojiInMessage } from "@esposter/db-schema";

import { getLiveRowWhere, roomEmojisInMessage } from "@esposter/db-schema";
import { and, eq, ne } from "drizzle-orm";

// The room's emoji answering to a name, as a subquery so the check and the write are one statement. An update leaves out
// The emoji it renames, which may keep its own name. A create leaves out nothing, so a replayed id the room already holds
// Is refused as the name the room uses, not left to the primary key
export const getRoomEmojiNameQuery = (
  db: Context["db"],
  roomId: RoomEmojiInMessage["roomId"],
  name: RoomEmojiInMessage["name"],
  exceptId?: RoomEmojiInMessage["id"],
) =>
  db
    .select({ id: roomEmojisInMessage.id })
    .from(roomEmojisInMessage)
    .where(
      and(
        eq(roomEmojisInMessage.roomId, roomId),
        eq(roomEmojisInMessage.name, name),
        getLiveRowWhere(roomEmojisInMessage),
        exceptId === undefined ? undefined : ne(roomEmojisInMessage.id, exceptId),
      ),
    );
