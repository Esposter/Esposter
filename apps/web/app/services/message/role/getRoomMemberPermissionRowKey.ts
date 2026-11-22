import type { RowKeyOf } from "#src/models/shared/overlay/RowKeyOf";
import type { roomMemberPermissionsInMessage } from "@esposter/db-schema";

// The key of an override row: the member and the room, in the order the table's composite key names them
export const getRoomMemberPermissionRowKey = (
  userId: string,
  roomId: string,
): RowKeyOf<typeof roomMemberPermissionsInMessage> => [userId, roomId];
