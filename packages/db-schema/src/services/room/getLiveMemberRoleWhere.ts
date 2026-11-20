import type { SQLWrapper } from "drizzle-orm";

import { isNull } from "drizzle-orm";

// A role a member holds is live until its revocation, or the deletion of the role, leaves the assignment as a tombstone.
// Each reader that decides from who holds a role asks for live assignments here
export const getLiveMemberRoleWhere = (memberRole: { deletedAt: SQLWrapper }) => isNull(memberRole.deletedAt);
