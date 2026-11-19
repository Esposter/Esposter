import { scopedBy } from "#server/services/db/scopedBy";

// The row with this id inside the room its permission was checked against, so a manager of one room cannot reach another's
export const inRoom = scopedBy("roomId");
