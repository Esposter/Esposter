import type { z } from "zod";

import { selectRoomInMessageSchema } from "@esposter/db-schema";

export const updateRoomInputSchema = selectRoomInMessageSchema.pick({ id: true, name: true }).partial({ name: true });
export type UpdateRoomInput = z.infer<typeof updateRoomInputSchema>;
