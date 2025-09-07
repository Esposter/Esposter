import type { Context } from "@@/server/trpc/context";

import { invites } from "#shared/db/schema/invites";
import { dayjs } from "#shared/services/dayjs";
import { and, eq } from "drizzle-orm";

export const readInviteCode = async (db: Context["db"], userId: string, roomId: string, isAutoDelete = false) => {
  const invite = await db.query.invites.findFirst({
    where: (invites, { and, eq }) => and(eq(invites.userId, userId), eq(invites.roomId, roomId)),
  });
  if (!invite) return null;
  else if (dayjs(invite.createdAt).add(24, "hours").isAfter(Date.now())) return invite.code;
  else if (isAutoDelete) await db.delete(invites).where(and(eq(invites.userId, userId), eq(invites.roomId, roomId)));
  return null;
};
