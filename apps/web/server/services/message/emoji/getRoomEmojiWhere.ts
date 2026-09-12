import type { RoomEmojiInMessage } from "@esposter/db-schema";

import { roomEmojisInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";
// An emoji is addressed by both keys so the room the permission was checked against is the room the row must
// Belong to — an id alone would let a manager of one room rename or delete another's
export const getRoomEmojiWhere = (id: RoomEmojiInMessage["id"], roomId: RoomEmojiInMessage["roomId"]) =>
  and(eq(roomEmojisInMessage.id, id), eq(roomEmojisInMessage.roomId, roomId));
