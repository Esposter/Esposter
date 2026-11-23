import type { Entry } from "#src/models/shared/overlay/Entry";
import type { RoomInMessage } from "@esposter/db-schema";

import { roomTable } from "#src/services/message/room/constants";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// The named fields of a room the overlay holds take the write's values at once, and the rest of its row stays. A room
// The Overlay does not hold is left as it is, so the write changes nothing on screen
export const getRoomPatchEntry = (id: RoomInMessage["id"], patch: Partial<RoomInMessage>): Entry =>
  getHeldRowEntry(roomTable, [id], (room) => ({ ...room, ...patch }));
