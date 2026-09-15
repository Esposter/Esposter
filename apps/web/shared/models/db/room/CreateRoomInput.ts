import { refineRoomSchema, selectRoomInMessageSchema } from "@esposter/db-schema";
import type { z } from "zod";

export const createRoomInputSchema = refineRoomSchema(selectRoomInMessageSchema.pick({ name: true }));
export type CreateRoomInput = z.infer<typeof createRoomInputSchema>;
