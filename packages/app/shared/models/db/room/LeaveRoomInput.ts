import type { z } from "zod";

import { selectRoomSchema } from "@esposter/db-schema";

export const leaveRoomInputSchema = selectRoomSchema.shape.id;
export type LeaveRoomInput = z.infer<typeof leaveRoomInputSchema>;
