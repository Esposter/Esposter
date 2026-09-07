import type { z } from "zod";

import { selectRoomInMessageSchema } from "@esposter/db-schema";

export const readRoomInputSchema = selectRoomInMessageSchema.shape.id.optional();
export type ReadRoomInput = z.infer<typeof readRoomInputSchema>;
