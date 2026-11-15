import type { Context } from "#server/trpc/context";
import type { InviteInMessage } from "@esposter/db-schema";

import { getAdmittedInviteWhere } from "#server/services/room/getAdmittedInviteWhere";
import { checkIsInviteUsable } from "#shared/services/room/invite/checkIsInviteUsable";
import { invitesInMessage } from "@esposter/db-schema";

// The invite a code answers for this user, or nothing. An unknown code, an expired or exhausted one, one whose room is
// Paused and one held by a user banned from that room all read as absent, so the caller learns nothing about which
export const resolveLiveInvite = async (
  db: Context["db"],
  id: string,
  userId: string,
): Promise<InviteInMessage | undefined> => {
  const [invite] = await db
    .select()
    .from(invitesInMessage)
    .where(getAdmittedInviteWhere(db, id, userId))
    .limit(1);
  if (!invite || !checkIsInviteUsable(invite)) return undefined;
  return invite;
};
