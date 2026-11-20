import { createTable } from "#src/services/shared/overlay/createTable";
import { userStatusesInMessage } from "@esposter/db-schema";

// The picker opens above the status bar at the bottom of the sidebar, aligned to its start
export const STATUS_PICKER_POSITION_AREA = "top span-right";
// A person's status row, held by the person's id, which the status store reads and the picker's entry changes
export const statusTable = createTable(userStatusesInMessage);
