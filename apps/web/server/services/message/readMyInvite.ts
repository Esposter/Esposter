import type { Context } from "#server/trpc/context";
import type { InviteInMessage } from "@esposter/db-schema";

import { checkIsInviteUsable } from "#shared/services/room/invite/checkIsInviteUsable";
import { getLiveRowWhere, invitesInMessage } from "@esposter/db-schema";
import { and, asc, desc, eq } from "drizzle-orm";

// The member's own link in the room: a live one before any tombstone, and the newest of those. A lapsed link is
// Tombstoned Here, since this read is where it is found, so the answer names its removal at a version. A tombstone is
// Answered as it Stands, so a reader holding the link it replaced drops it
export const readMyInvite = async (
  db: Context["db"],
  userId: string,
  roomId: string,
): Promise<InviteInMessage | undefined> => {
  const [invite] = await db
    .select()
    .from(invitesInMessage)
    .where(and(eq(invitesInMessage.roomId, roomId), eq(invitesInMessage.userId, userId)))
    .orderBy(asc(invitesInMessage.deletedAt), desc(invitesInMessage.createdAt))
    .limit(1);
  if (!invite || invite.deletedAt || checkIsInviteUsable(invite)) return invite;
  // Tombstoned by primary key under the live guard, so a create that minted a fresh link meanwhile is never the row
  // Removed
  const [lapsedInvite] = await db
    .update(invitesInMessage)
    .set({ deletedAt: new Date() })
    .where(and(eq(invitesInMessage.id, invite.id), getLiveRowWhere(invitesInMessage)))
    .returning();
  if (lapsedInvite) return lapsedInvite;
  // The guard matched nothing, so a create replaced the link meanwhile and tombstoned it: the row as it now stands is
  // The answer
  const [replacedInvite] = await db.select().from(invitesInMessage).where(eq(invitesInMessage.id, invite.id)).limit(1);
  return replacedInvite;
};
