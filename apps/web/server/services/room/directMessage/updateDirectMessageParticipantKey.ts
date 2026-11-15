import type { Context } from "#server/trpc/context";
import type { RoomInMessage } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { getDirectMessageParticipantKey } from "#server/services/room/directMessage/getDirectMessageParticipantKey";
import { roomsInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// The one writer of a direct message's participant key, for an add and a removal alike. The precondition is the key the
// Caller read the participants against, so a write computed from a list a concurrent change has since replaced matches
// No row and returns none, and the caller refuses the batch its membership writes belong to
export const updateDirectMessageParticipantKey = (
  db: Context["db"],
  roomId: RoomInMessage["id"],
  precondition: SQL,
  userIds: string[],
  ownerId?: RoomInMessage["userId"],
) =>
  db
    .update(roomsInMessage)
    .set({ participantKey: getDirectMessageParticipantKey(userIds), userId: ownerId })
    .where(and(eq(roomsInMessage.id, roomId), precondition))
    .returning();
