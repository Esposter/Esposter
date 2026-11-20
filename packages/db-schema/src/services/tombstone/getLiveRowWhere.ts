import type { SQLWrapper } from "drizzle-orm";

import { isNull } from "drizzle-orm";

// A row of an object's table is live until its deletion leaves a tombstone, so each read and each alarm decision that is
// About live rows takes this filter, on the table or on an alias of it. A tombstone is kept until the object's purge removes it
export const getLiveRowWhere = (row: { deletedAt: SQLWrapper }) => isNull(row.deletedAt);
