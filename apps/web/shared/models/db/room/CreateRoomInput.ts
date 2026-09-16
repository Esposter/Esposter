import type { z } from "zod";

import { refineRoomSchema, selectRoomInMessageSchema } from "@esposter/db-schema";

export const createRoomInputSchema = refineRoomSchema(selectRoomInMessageSchema.pick({ name: true }));
export type CreateRoomInput = z.infer<typeof createRoomInputSchema>;
