import type { Context } from "#server/trpc/context";
import type { SQL } from "drizzle-orm";

import { bansInMessage, invitesInMessage, roomsInMessage } from "@esposter/db-schema";
import { and, eq, exists, isNull, notExists, sql } from "drizzle-orm";

// The row of a link while its room is open to invites and holds no active ban for the user. A link's own expiry and uses
// Are decided where it is read: a reader by checkIsInviteUsable, and the join in the statement that consumes a use
export const getAdmittedInviteWhere = (db: Context["db"], code: string, userId: string): SQL | undefined =>
  and(
    eq(invitesInMessage.id, code),
    exists(
      db
        .select({ _: sql`1` })
        .from(roomsInMessage)
        .where(and(eq(roomsInMessage.id, invitesInMessage.roomId), eq(roomsInMessage.isInvitePaused, false))),
    ),
    notExists(
      db
        .select({ _: sql`1` })
        .from(bansInMessage)
        .where(
          and(
            eq(bansInMessage.roomId, invitesInMessage.roomId),
            eq(bansInMessage.userId, userId),
            isNull(bansInMessage.deletedAt),
          ),
        ),
    ),
  );
