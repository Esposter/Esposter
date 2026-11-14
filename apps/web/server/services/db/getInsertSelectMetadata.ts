import type { AnyColumn } from "drizzle-orm";

import { sql } from "drizzle-orm";

// The metadata columns default by $defaultFn, which only a values insert runs, so an insert ... select binds them. A
// Bare sql.param is not an SQL chunk and cannot stand as a select field, so each is wrapped in a template
export const getInsertSelectMetadata = (table: { createdAt: AnyColumn; updatedAt: AnyColumn }) => {
  const now = new Date();
  return { createdAt: sql`${sql.param(now, table.createdAt)}`, updatedAt: sql`${sql.param(now, table.updatedAt)}` };
};
