import { createTable } from "#src/services/shared/overlay/createTable";
import { usersToRoomsInMessage } from "@esposter/db-schema";

// The memberships the overlay holds, one slot. A membership is keyed by its user and its room
export const userToRoomTable = createTable(usersToRoomsInMessage);
