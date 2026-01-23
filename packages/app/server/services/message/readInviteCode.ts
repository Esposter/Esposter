import type { Context } from "@@/server/trpc/context";

import { dayjs } from "#shared/services/dayjs";
import { invitesInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

export const readInviteCode = async (db: Context["db"], userId: string, roomId: string, isAutoDelete = false) => {
  const invite = await db.query.invitesInMessage.findFirst({
    where: (invitesInMessage, { and, eq }) =>
      and(eq(invitesInMessage.userId, userId), eq(invitesInMessage.roomId, roomId)),
  });
  if (!invite) return null;
  else if (dayjs(invite.createdAt).add(24, "hours").isAfter(Date.now())) return invite.code;
  else if (isAutoDelete)
    await db
      .delete(invitesInMessage)
      .where(and(eq(invitesInMessage.userId, userId), eq(invitesInMessage.roomId, roomId)));
  return null;
};
