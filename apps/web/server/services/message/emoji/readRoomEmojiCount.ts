import type { Context } from "#server/trpc/context";
import type { RoomInMessage } from "@esposter/db-schema";

import { roomEmojisInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { count, eq } from "drizzle-orm";

// How many emoji a room holds, which the cap is checked against where a room is asked for an upload target and
// Where an emoji is created
export const readRoomEmojiCount = async (db: Context["db"], roomId: RoomInMessage["id"]) =>
  takeOne(await db.select({ count: count() }).from(roomEmojisInMessage).where(eq(roomEmojisInMessage.roomId, roomId)))
    .count;
