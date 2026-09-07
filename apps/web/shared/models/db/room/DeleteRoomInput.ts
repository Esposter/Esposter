import type { z } from "zod";

import { selectRoomInMessageSchema } from "@esposter/db-schema";

export const deleteRoomInputSchema = selectRoomInMessageSchema.shape.id;
export type DeleteRoomInput = z.infer<typeof deleteRoomInputSchema>;
