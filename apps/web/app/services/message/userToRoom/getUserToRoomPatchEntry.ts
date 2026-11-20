import type { Entry } from "#src/models/shared/overlay/Entry";
import type { UserToRoomInMessage } from "@esposter/db-schema";

import { userToRoomTable } from "#src/services/message/userToRoom/constants";
import { getUserToRoomRowKey } from "#src/services/message/userToRoom/getUserToRoomRowKey";

// The viewer's membership takes the fields the write sets at once, and keeps the rest of its row
export const getUserToRoomPatchEntry =
  (userId: string, roomId: string, patch: Partial<UserToRoomInMessage>): Entry =>
  (view) => {
    const key = getUserToRoomRowKey(userId, roomId);
    const userToRoom = view.get(userToRoomTable, key);
    if (userToRoom) view.set(userToRoomTable, key, { ...userToRoom, ...patch });
  };
