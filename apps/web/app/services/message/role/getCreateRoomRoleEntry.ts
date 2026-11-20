import type { Entry } from "#src/models/shared/overlay/Entry";
import type { RoomRoleInMessage } from "@esposter/db-schema";

import { roomRoleTable } from "#src/services/message/role/constants";

// The role is drawn at once under the id the client gave it, with no version until the server's row arrives
export const getCreateRoomRoleEntry =
  (roomRole: RoomRoleInMessage): Entry =>
  (view) => {
    view.set(roomRoleTable, [roomRole.id], roomRole);
  };
