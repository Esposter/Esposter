import type { Entry } from "#src/models/shared/overlay/Entry";
import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { roomCategoryTable } from "#src/services/message/roomCategory/constants";

// The category is drawn at once under the id the client gave it, with no version until the server's row arrives. Its
// Position is not the client's to compute: the server appends it, and the list places a row with no version after the
// Server's rows, so the placeholder's own position is never read
export const getCreateRoomCategoryEntry =
  (roomCategory: RoomCategoryInMessage): Entry =>
  (view) => {
    view.set(roomCategoryTable, [roomCategory.id], roomCategory);
  };
