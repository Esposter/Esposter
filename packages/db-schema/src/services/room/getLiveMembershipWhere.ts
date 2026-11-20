import type { SQLWrapper } from "drizzle-orm";

import { isNull } from "drizzle-orm";

// A membership is live until its removal leaves it as a tombstone, so each reader that decides from membership asks for
// Live rows here, on the table or on an alias of it. A revival clears the tombstone, which makes the row live again
export const getLiveMembershipWhere = (membership: { deletedAt: SQLWrapper }) => isNull(membership.deletedAt);
