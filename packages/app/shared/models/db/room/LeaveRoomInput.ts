import { selectRoomSchema } from "#shared/db/schema/rooms";

export const leaveRoomInputSchema = selectRoomSchema.get("id");
export type LeaveRoomInput = typeof leaveRoomInputSchema.infer;
