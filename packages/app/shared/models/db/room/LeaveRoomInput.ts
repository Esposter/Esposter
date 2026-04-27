import type { z } from "zod";

import { selectRoomInMessageSchema } from "@esposter/db-schema";

export const leaveRoomInputSchema = selectRoomInMessageSchema.shape.id;
export type LeaveRoomInput = z.infer<typeof leaveRoomInputSchema>;
