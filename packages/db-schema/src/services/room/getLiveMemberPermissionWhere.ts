import type { SQLWrapper } from "drizzle-orm";

import { isNull } from "drizzle-orm";

// A member's override is live until its removal leaves it as a tombstone. A tombstoned override counts for nothing, so
// Each reader that decides from an override asks for live rows here
export const getLiveMemberPermissionWhere = (memberPermission: { deletedAt: SQLWrapper }) =>
  isNull(memberPermission.deletedAt);
