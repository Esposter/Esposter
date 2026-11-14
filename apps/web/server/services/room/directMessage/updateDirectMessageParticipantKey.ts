import type { Context } from "#server/trpc/context";
import type { RoomInMessage } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { getDirectMessageParticipantKey } from "#server/services/room/directMessage/getDirectMessageParticipantKey";
import { roomsInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

export const updateDirectMessageParticipantKey = (
  db: Context["db"],
  roomId: RoomInMessage["id"],
  userIds: string[],
  ownerId?: RoomInMessage["userId"],
  precondition?: SQL,
) =>
  db
    .update(roomsInMessage)
    .set({ participantKey: getDirectMessageParticipantKey(userIds), userId: ownerId })
    .where(and(eq(roomsInMessage.id, roomId), precondition))
    .returning();
