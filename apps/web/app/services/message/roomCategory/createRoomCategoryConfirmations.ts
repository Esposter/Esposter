import type { Confirmation } from "#src/models/shared/overlay/Confirmation";
import type { RowVersion } from "@esposter/db-schema";

import { roomCategoryTable } from "#src/services/message/roomCategory/constants";
import { createConfirmation } from "#src/services/shared/overlay/createConfirmation";

// The rows a write's answer named, as the confirmations its entry waits for. A row another table holds names no
// Category the entries show, so it confirms none
export const createRoomCategoryConfirmations = (rowVersions: RowVersion[]): Confirmation[] =>
  rowVersions.flatMap(({ key, table, version }) =>
    table === roomCategoryTable.name && key.id !== undefined
      ? [createConfirmation(roomCategoryTable, [key.id], version)]
      : [],
  );
