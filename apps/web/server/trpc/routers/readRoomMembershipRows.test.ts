import type { Context } from "#server/trpc/context";

import { getRoomMembershipWhere } from "#server/services/room/getRoomMembershipWhere";
import { usersToRoomsInMessage } from "@esposter/db-schema";
import { describe } from "vitest";

// The membership row a moderation or automod consequence lands on, read back by the pair that keys it — one row
// While the member is in the room, none once a kick or ban removed them
export const readRoomMembershipRows = (db: Context["db"], roomId: string, userId: string) =>
  db.select().from(usersToRoomsInMessage).where(getRoomMembershipWhere(roomId, userId));
// The membership row as stored, a removed one included
export const readRoomMembership = (db: Context["db"], roomId: string, userId: string) =>
  db.query.usersToRoomsInMessage.findFirst({ where: { roomId: { eq: roomId }, userId: { eq: userId } } });

describe.todo("readRoomMembershipRows");
