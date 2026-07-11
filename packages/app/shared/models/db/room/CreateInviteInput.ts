import { INVITE_MAX_USES_OPTIONS } from "#shared/services/room/invite/constants";
import { InviteExpireAfterMinutesMap } from "#shared/services/room/invite/InviteExpireAfterMinutesMap";
import { roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const createInviteInputSchema = z.object({
  ...roomIdSchema.shape,
  // 0 = never expires / unlimited uses — the numeric empty sentinel; the server maps 0 to the DB's null
  expireAfterMinutes: z.literal([...Object.values(InviteExpireAfterMinutesMap), 0]),
  maxUses: z.literal([...INVITE_MAX_USES_OPTIONS, 0]),
});
export type CreateInviteInput = z.infer<typeof createInviteInputSchema>;
