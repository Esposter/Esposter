import type { SQLWrapper } from "drizzle-orm";

import { isNull } from "drizzle-orm";

// A role is live until its deletion leaves it as a tombstone, so each reader that lists or decides from roles asks for live
// Rows here, on the table or on an alias of it
export const getLiveRoleWhere = (role: { deletedAt: SQLWrapper }) => isNull(role.deletedAt);
