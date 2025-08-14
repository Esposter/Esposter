import type { z } from "zod";

import { selectRoomSchema } from "#shared/db/schema/rooms";

export const leaveRoomInputSchema = selectRoomSchema.shape.id;
export type LeaveRoomInput = z.infer<typeof leaveRoomInputSchema>;
