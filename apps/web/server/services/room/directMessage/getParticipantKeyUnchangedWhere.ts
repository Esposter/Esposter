import type { Context } from "#server/trpc/context";
import type { RoomInMessage } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { roomsInMessage } from "@esposter/db-schema";
import { and, eq, exists, sql } from "drizzle-orm";

// The precondition every write of a direct message's participants carries: the room still holds the participant key the
// Write was computed from. IS rather than = so an unset key matches an unset one
export const getParticipantKeyUnchangedWhere = (
  db: Context["db"],
  roomId: RoomInMessage["id"],
  participantKey: RoomInMessage["participantKey"],
): SQL =>
  exists(
    db
      .select({ _: sql`1` })
      .from(roomsInMessage)
      .where(and(eq(roomsInMessage.id, roomId), sql`${roomsInMessage.participantKey} is ${participantKey}`)),
  );
