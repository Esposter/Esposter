import type { Entry } from "#src/models/shared/overlay/Entry";

import { userToRoomRoleTable } from "#src/services/message/role/constants";
import { getUserToRoomRoleRowKey } from "#src/services/message/role/getUserToRoomRoleRowKey";
import { NO_ROW_VERSION } from "@esposter/db-schema";

// The assignment is drawn at once, with no version until the server's row arrives, so the member shows the role the moment
// It is given. The role itself is drawn only where the client holds it
export const getAssignRoomRoleEntry =
  (roomId: string, userId: string, roleId: string, now: Date): Entry =>
  (view) => {
    view.set(userToRoomRoleTable, getUserToRoomRoleRowKey(userId, roomId, roleId), {
      createdAt: now,
      deletedAt: null,
      roleId,
      roomId,
      updatedAt: now,
      userId,
      version: NO_ROW_VERSION,
    });
  };
