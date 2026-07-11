import { INVITE_MAX_USES_OPTIONS } from "#shared/services/room/invite/constants";
import { InviteExpireAfterMinutesMap } from "#shared/services/room/invite/InviteExpireAfterMinutesMap";
import { roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const createInviteInputSchema = z.object({
  ...roomIdSchema.shape,
  // Null = never expires / unlimited uses
  expireAfterMinutes: z.literal(Object.values(InviteExpireAfterMinutesMap)).nullable(),
  maxUses: z.literal(INVITE_MAX_USES_OPTIONS).nullable(),
});
export type CreateInviteInput = z.infer<typeof createInviteInputSchema>;
