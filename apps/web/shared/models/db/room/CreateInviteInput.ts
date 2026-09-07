import { INVITE_MAX_USES_OPTIONS } from "#shared/services/room/invite/constants";
import { InviteExpireAfterMinutes } from "#shared/services/room/invite/InviteExpireAfterMinutesMap";
import { roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const createInviteInputSchema = z.object({
  ...roomIdSchema.shape,
  // 0 = never expires / unlimited uses — the numeric empty sentinel. maxUses stores 0 as-is;
  // ExpireAfterMinutes maps to a null expiresAt since timestamps have no empty value
  expireAfterMinutes: z.literal([...InviteExpireAfterMinutes, 0]),
  maxUses: z.literal([...INVITE_MAX_USES_OPTIONS, 0]),
});
export type CreateInviteInput = z.infer<typeof createInviteInputSchema>;
