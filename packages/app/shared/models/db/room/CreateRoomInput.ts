import { selectRoomSchema } from "#shared/db/schema/rooms";

export const createRoomInputSchema = selectRoomSchema.pick("name");
export type CreateRoomInput = typeof createRoomInputSchema.infer;
