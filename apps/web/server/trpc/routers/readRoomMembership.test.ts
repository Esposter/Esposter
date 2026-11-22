import type { Context } from "#server/trpc/context";

import { describe } from "vitest";

// The membership row as stored, a removed one included
export const readRoomMembership = (db: Context["db"], roomId: string, userId: string) =>
  db.query.usersToRoomsInMessage.findFirst({ where: { roomId: { eq: roomId }, userId: { eq: userId } } });

describe.todo("readRoomMembership");
