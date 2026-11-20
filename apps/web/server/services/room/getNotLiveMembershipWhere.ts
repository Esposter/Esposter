import type { Context } from "#server/trpc/context";
import type { SQL } from "drizzle-orm";

import { getLiveMembershipWhere, invitesInMessage, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq, notExists, sql } from "drizzle-orm";

// Whether the invite's room holds no live membership of the user. A join counts its use only when this holds, so a
// Second join of the link at once finds the membership the first one wrote, and counts nothing
export const getNotLiveMembershipWhere = (db: Context["db"], userId: string): SQL =>
  notExists(
    db
      .select({ _: sql`1` })
      .from(usersToRoomsInMessage)
      .where(
        and(
          eq(usersToRoomsInMessage.roomId, invitesInMessage.roomId),
          eq(usersToRoomsInMessage.userId, userId),
          getLiveMembershipWhere(usersToRoomsInMessage),
        ),
      ),
  );
