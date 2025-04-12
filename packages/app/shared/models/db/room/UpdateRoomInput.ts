import { selectRoomSchema } from "#shared/db/schema/rooms";

export const updateRoomInputSchema = selectRoomSchema.pick("id").merge(selectRoomSchema.partial().pick("name"));
export type UpdateRoomInput = typeof updateRoomInputSchema.infer;
