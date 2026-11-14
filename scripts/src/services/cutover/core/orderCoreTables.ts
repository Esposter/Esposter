import type { CoreTable } from "#src/models/cutover/CoreTable";

import { InvalidOperationError, Operation } from "@esposter/shared";

// Parents before children, so every row's foreign key exists by the time the row is written.
// A table that references itself is ready once its other parents are, and a cycle has no such order.
// It is refused rather than broken by a guess
export const orderCoreTables = (tables: CoreTable[]): CoreTable[] => {
  const remaining = new Map(tables.map((table) => [table.name, table]));
  const ordered: CoreTable[] = [];
  while (remaining.size > 0) {
    const ready = [...remaining.values()].filter(({ foreignTableNames, name }) =>
      foreignTableNames.every((foreignTableName) => foreignTableName === name || !remaining.has(foreignTableName)),
    );
    if (ready.length === 0)
      throw new InvalidOperationError(
        Operation.Read,
        [...remaining.keys()].join(", "),
        "reference each other in a cycle, so no copy order satisfies every foreign key",
      );
    for (const table of ready) {
      ordered.push(table);
      remaining.delete(table.name);
    }
  }
  return ordered;
};
