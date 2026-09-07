import type { InviteInMessage } from "@esposter/db-schema";

export const checkIsInviteUsable = (invite: Pick<InviteInMessage, "expiresAt" | "maxUses" | "uses">): boolean =>
  (invite.expiresAt === null || invite.expiresAt.getTime() > Date.now()) &&
  (!invite.maxUses || invite.uses < invite.maxUses);
