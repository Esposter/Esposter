import type { z } from "zod";

import { selectRoomInMessageSchema } from "@esposter/db-schema";

export const createRoomInputSchema = selectRoomInMessageSchema.pick({ name: true });
export type CreateRoomInput = z.infer<typeof createRoomInputSchema>;
