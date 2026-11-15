import type { Context } from "#server/trpc/context";
import type { SQL } from "drizzle-orm";

import { getAdmittedInviteWhere } from "#server/services/room/getAdmittedInviteWhere";
import { invitesInMessage } from "@esposter/db-schema";
import { and, eq, gt, isNull, lt, or } from "drizzle-orm";

// Whether an invite link still admits a user: its room open to invites, no active ban for the user there, unexpired and
// With uses left. The join's statements select on it, so the use is consumed by the statement that admits the user
export const getLiveInviteWhere = (db: Context["db"], code: string, userId: string): SQL | undefined =>
  and(
    getAdmittedInviteWhere(db, code, userId),
    or(isNull(invitesInMessage.expiresAt), gt(invitesInMessage.expiresAt, new Date())),
    or(eq(invitesInMessage.maxUses, 0), lt(invitesInMessage.uses, invitesInMessage.maxUses)),
  );
