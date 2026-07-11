import type { Context } from "@@/server/trpc/context";
import type { InviteInMessage } from "@esposter/db-schema";

import { checkIsInviteUsable } from "@@/server/services/message/checkIsInviteUsable";
import { invitesInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// Expired/exhausted invites are inert rows — reads treat them as absent and lazily delete them
export const readMyInvite = async (
  db: Context["db"],
  userId: string,
  roomId: string,
): Promise<InviteInMessage | null> => {
  const invite = await db.query.invitesInMessage.findFirst({
    where: {
      roomId: {
        eq: roomId,
      },
      userId: {
        eq: userId,
      },
    },
  });
  if (!invite) return null;
  else if (checkIsInviteUsable(invite)) return invite;

  await db
    .delete(invitesInMessage)
    .where(and(eq(invitesInMessage.userId, userId), eq(invitesInMessage.roomId, roomId)));
  return null;
};
