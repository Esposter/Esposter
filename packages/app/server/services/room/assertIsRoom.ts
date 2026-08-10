import type { Context } from "@@/server/trpc/context";

import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { DatabaseEntityType, RoomType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// A room that is missing and a room of the wrong type are the same refusal on purpose: a direct message id
// Handed to a room procedure must not read back any differently from an id that does not exist, or the
// Rejection tells a caller which rooms are real
export const assertIsRoom = async (
  db: Context["db"] | Parameters<Parameters<Context["db"]["transaction"]>[0]>[0],
  roomId: string,
  type: RoomType = RoomType.Room,
): Promise<void> => {
  const room = await db.query.roomsInMessage.findFirst({ where: { id: { eq: roomId } } });
  if (room?.type !== type) throw getInvalidOperationError(Operation.Read, DatabaseEntityType.Room, roomId);
};
