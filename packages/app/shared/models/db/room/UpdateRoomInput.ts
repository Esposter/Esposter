import { selectRoomSchema } from "#shared/db/schema/rooms";

export const updateRoomInputSchema = selectRoomSchema.pick("id").merge(selectRoomSchema.pick("name").partial());
export type UpdateRoomInput = typeof updateRoomInputSchema.infer;
