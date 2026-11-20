import type { Entry } from "#src/models/shared/overlay/Entry";
import type { UserToRoomInMessage } from "@esposter/db-schema";

import { userToRoomTable } from "#src/services/message/userToRoom/constants";

// The viewer's membership takes the fields the write sets at once, and keeps the rest of its row
export const getUserToRoomPatchEntry =
  (userId: string, roomId: string, patch: Partial<UserToRoomInMessage>): Entry =>
  (view) => {
    // The membership's composite key names the user, then the room
    const key: [string, string] = [userId, roomId];
    const userToRoom = view.get(userToRoomTable, key);
    if (userToRoom) view.set(userToRoomTable, key, { ...userToRoom, ...patch });
  };
