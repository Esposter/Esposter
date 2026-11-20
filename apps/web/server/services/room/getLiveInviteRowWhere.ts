import type { SQLWrapper } from "drizzle-orm";

import { isNull } from "drizzle-orm";

// An invite is live until it is revoked, replaced or lapsed and tombstoned, so each statement that consumes or changes a link
// Asks for live rows here. The join's admission check reads it through `getAdmittedInviteWhere`
export const getLiveInviteRowWhere = (invite: { deletedAt: SQLWrapper }) => isNull(invite.deletedAt);
