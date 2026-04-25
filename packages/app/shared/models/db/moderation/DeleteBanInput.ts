import { roomIdSchema, userIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteBanInputSchema = z.object({
  ...roomIdSchema.shape,
  ...userIdSchema.shape,
});
export type DeleteBanInput = z.infer<typeof deleteBanInputSchema>;
