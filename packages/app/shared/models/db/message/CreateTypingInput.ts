import { roomIdSchema, selectUserSchema, userIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const createTypingInputSchema = z.object({
  ...roomIdSchema.shape,
  ...userIdSchema.shape,
  username: selectUserSchema.shape.name,
});
export type CreateTypingInput = z.infer<typeof createTypingInputSchema>;
