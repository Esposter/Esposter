import type { Context } from "#server/trpc/context";
import type { SQL, SQLWrapper, Table } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

import { CASCADE_LEFT_TO_PURGE } from "#server/services/tombstone/constants";
import { getRemovalConditions } from "@esposter/db";
import { getLiveRowWhere, OVERLAY_TOMBSTONE_TABLES } from "@esposter/db-schema";
import { and, getTableName } from "drizzle-orm";

// The tombstones a delete owes its cascade: one statement per overlay table the cascade reaches, on the rows it would
// Remove that are still live. The registry names the tables and the foreign keys name the reach, so a table the registry
// Adds is tombstoned by a delete that names no table of its own. `table` is the delete's, `batched` lists the tables the
// Caller writes itself, and CASCADE_LEFT_TO_PURGE stays live. With no `where` there are no rows to name, so no statement.
// The registry is a parameter only so a suite can name a table the registry does not hold yet; every caller leaves it out
export const getCascadeTombstones = (
  db: Context["db"],
  table: Table,
  where: SQL | undefined,
  batched: Table[] = [],
  registry: readonly ({ deletedAt: SQLWrapper } & SQLiteTable)[] = OVERLAY_TOMBSTONE_TABLES,
) => {
  if (where === undefined) return [];
  const { conditionOf, removedTables } = getRemovalConditions(db, table, where);
  const reachedNames = new Set(removedTables.map((removedTable) => getTableName(removedTable)));
  const leftNames = new Set(
    [table, ...batched, ...CASCADE_LEFT_TO_PURGE.map(({ table: purgedTable }) => purgedTable)].map((leftTable) =>
      getTableName(leftTable),
    ),
  );
  // Passed as a value rather than written as a literal in the statement, so each tombstone is one set for every table
  const tombstone = { deletedAt: new Date() };
  return registry.flatMap((tombstoneTable) => {
    const name = getTableName(tombstoneTable);
    const condition = reachedNames.has(name) && !leftNames.has(name) ? conditionOf(tombstoneTable) : undefined;
    return condition === undefined
      ? []
      : [
          db
            .update(tombstoneTable)
            .set(tombstone)
            .where(and(condition, getLiveRowWhere(tombstoneTable))),
        ];
  });
};
