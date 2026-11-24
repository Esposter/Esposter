import { scopedBy } from "#server/services/db/scopedBy";

// The row with this id inside the room its permission was checked against.
// So a manager of one room cannot reach another room's row.
export const inRoom = scopedBy("roomId");
