import { roomIdSchema, selectInviteInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const revokeInviteInputSchema = z.object({
  ...roomIdSchema.shape,
  ...selectInviteInMessageSchema.pick({ id: true }).shape,
});
export type RevokeInviteInput = z.infer<typeof revokeInviteInputSchema>;
