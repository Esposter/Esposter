import type { AnyColumn } from "drizzle-orm";

import { sql } from "drizzle-orm";

// The metadata columns default by $defaultFn, which only a values insert runs, so an insert ... select binds them. A
// Bare sql.param is not an SQL chunk and cannot stand as a select field, so each is wrapped in a template, and aliased
// To its column, since a select field that is an unnamed SQL chunk has no name for the insert to match
export const getInsertSelectMetadata = (table: { createdAt: AnyColumn; updatedAt: AnyColumn }) => {
  const now = new Date();
  return {
    createdAt: sql`${sql.param(now, table.createdAt)}`.as(table.createdAt.name),
    updatedAt: sql`${sql.param(now, table.updatedAt)}`.as(table.updatedAt.name),
  };
};
