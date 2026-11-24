import { createTable } from "#src/services/shared/overlay/createTable";
import { roomsInMessage } from "@esposter/db-schema";

// The rooms the overlay holds, one slot. A room is keyed by its id.
// The list shows each one its viewer is a member of.
export const roomTable = createTable(roomsInMessage);
