import type { z } from "zod/v4";

import { selectRoomSchema } from "#shared/db/schema/rooms";

export const leaveRoomInputSchema = selectRoomSchema.shape.id;
export type LeaveRoomInput = z.infer<typeof leaveRoomInputSchema>;
