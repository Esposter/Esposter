import { roomIdSchema, roomMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

// A message is addressed by its room and its integer id within that room
export const messageIdentityInputSchema = z.object({ ...roomIdSchema.shape, id: roomMessageSchema.shape.id });
export type MessageIdentityInput = z.infer<typeof messageIdentityInputSchema>;
