import type { AnyColumn } from "drizzle-orm";

import { and, eq } from "drizzle-orm";

// Ownership guard: the row with this id must belong to the given user.
export const ownedBy = (table: { id: AnyColumn; userId: AnyColumn }, id: string, userId: string) =>
  and(eq(table.id, id), eq(table.userId, userId));
