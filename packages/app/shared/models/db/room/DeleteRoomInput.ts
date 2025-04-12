import { selectRoomSchema } from "#shared/db/schema/rooms";

export const deleteRoomInputSchema = selectRoomSchema.get("id");
export type DeleteRoomInput = typeof deleteRoomInputSchema.infer;
