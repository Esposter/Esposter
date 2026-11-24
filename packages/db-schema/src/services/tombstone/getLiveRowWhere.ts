import type { SQLWrapper } from "drizzle-orm";

import { isNull } from "drizzle-orm";

// A row is live until its removal leaves a tombstone, so each read and each decision that is about live rows takes this
// Filter, on the table or on an alias of it. That covers a membership and a row of an object's table alike. A tombstone
// Is kept until the purge removes it, and a revival clears it, which makes the row live again
export const getLiveRowWhere = (row: { deletedAt: SQLWrapper }) => isNull(row.deletedAt);
