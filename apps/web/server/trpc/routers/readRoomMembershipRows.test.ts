import type { Context } from "@@/server/trpc/context";

import { usersToRoomsInMessage } from "@esposter/db-schema";
import { getRoomMembershipWhere } from "@@/server/services/room/getRoomMembershipWhere";
import { describe } from "vitest";

// The membership row a moderation or automod consequence lands on, read back by the pair that keys it — one row
// While the member is in the room, none once a kick or ban removed them
export const readRoomMembershipRows = (db: Context["db"], roomId: string, userId: string) =>
  db.select().from(usersToRoomsInMessage).where(getRoomMembershipWhere(roomId, userId));

describe.todo("readRoomMembershipRows");
