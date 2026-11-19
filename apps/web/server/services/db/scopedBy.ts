import type { AnyColumn } from "drizzle-orm";

import { and, eq } from "drizzle-orm";

// The row with this id, held within one scope. Ownership (ownedBy) and room membership (inRoom) are the same predicate
// Over a different column, so each names only the scope column it is held by
export const scopedBy =
  <Scope extends string>(scope: Scope) =>
  (table: Record<"id" | Scope, AnyColumn>, id: string, scopeId: string) =>
    and(eq(table.id, id), eq(table[scope], scopeId));
