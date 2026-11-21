import type { Entry } from "#src/models/shared/overlay/Entry";
import type { UserToRoomInMessage } from "@esposter/db-schema";

import { userToRoomTable } from "#src/services/message/userToRoom/constants";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// The viewer's membership takes the fields the write sets at once, and keeps the rest of its row. The membership's
// Composite key names the user, then the room
export const getUserToRoomPatchEntry = (userId: string, roomId: string, patch: Partial<UserToRoomInMessage>): Entry =>
  getHeldRowEntry(userToRoomTable, [userId, roomId], (userToRoom) => ({ ...userToRoom, ...patch }));
