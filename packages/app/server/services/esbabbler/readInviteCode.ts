import type { Context } from "@@/server/trpc/context";

import { invites } from "#shared/db/schema/invites";
import { rooms } from "#shared/db/schema/rooms";
import { users } from "#shared/db/schema/users";
import { dayjs } from "#shared/services/dayjs";
import { and, eq } from "drizzle-orm";

export const readInviteCode = async (db: Context["db"], userId: string, roomId: string) => {
  const invite = (
    await db
      .select()
      .from(invites)
      .innerJoin(users, and(eq(users.id, invites.userId)))
      .innerJoin(rooms, and(eq(rooms.id, invites.roomId)))
      .where(and(eq(invites.userId, userId), eq(invites.roomId, roomId)))
  ).find(Boolean);
  if (!invite) return null;
  else if (dayjs(invite.invites.createdAt).add(24, "hours").isAfter(new Date())) return invite.invites.code;
  else {
    await db.delete(invites).where(and(eq(invites.userId, userId), eq(invites.roomId, roomId)));
    return null;
  }
};
