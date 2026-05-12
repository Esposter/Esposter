import type { Context } from "@@/server/trpc/context";

import { dayjs } from "#shared/services/dayjs";
import { invitesInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

export const readInviteToken = async (
  db: Context["db"],
  userId: string,
  roomId: string,
  isAutoDelete = false,
): Promise<string> => {
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
  if (!invite) return "";
  else if (dayjs(invite.createdAt).add(24, "hours").isAfter(Date.now())) return invite.token;
  else if (isAutoDelete)
    await db
      .delete(invitesInMessage)
      .where(and(eq(invitesInMessage.userId, userId), eq(invitesInMessage.roomId, roomId)));
  return "";
};
