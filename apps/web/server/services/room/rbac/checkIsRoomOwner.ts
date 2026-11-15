import type { RoomInMessage } from "@esposter/db-schema";

// The one question of who owns a room, asked by every authority read and by the role list. The owner holds no role
// Row, so the room's `userId` alone is what makes a user its owner
export const checkIsRoomOwner = (room: Pick<RoomInMessage, "userId"> | undefined, userId: string): boolean =>
  room?.userId === userId;
