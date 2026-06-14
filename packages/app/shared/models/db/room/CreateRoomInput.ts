import { refineRoomSchema, selectRoomInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const createRoomInputSchema = refineRoomSchema(selectRoomInMessageSchema.pick({ name: true }));
export type CreateRoomInput = z.infer<typeof createRoomInputSchema>;
