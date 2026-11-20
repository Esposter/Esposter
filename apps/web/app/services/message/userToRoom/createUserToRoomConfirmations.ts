import type { Confirmation } from "#src/models/shared/overlay/Confirmation";
import type { RowVersion } from "@esposter/db-schema";

import { userToRoomTable } from "#src/services/message/userToRoom/constants";
import { getUserToRoomRowKey } from "#src/services/message/userToRoom/getUserToRoomRowKey";
import { createConfirmation } from "#src/services/shared/overlay/createConfirmation";

// The rows a write's answer named, as the confirmations its entry waits for. A row another table holds names no
// Membership the entries show, so it confirms none
export const createUserToRoomConfirmations = (rowVersions: RowVersion[]): Confirmation[] =>
  rowVersions.flatMap(({ key, table, version }) =>
    table === userToRoomTable.name && key.userId !== undefined && key.roomId !== undefined
      ? [createConfirmation(userToRoomTable, getUserToRoomRowKey(key.userId, key.roomId), version)]
      : [],
  );
