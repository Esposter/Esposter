import type { CoreTable } from "#src/models/cutover/CoreTable";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";
import { createSourceClient } from "#src/services/cutover/postgres/createSourceClient";

type SourceClient = ReturnType<typeof createSourceClient>;

// Postgres keeps microseconds and D1 milliseconds, so two rows that differ only below a millisecond collide once copied.
// The source is checked at the precision D1 will hold, before a copy whose unique index would reject the second row
export const checkTimestampUniqueIndexes = async (source: SourceClient, table: CoreTable): Promise<void> => {
  for (const group of table.timestampUniqueColumnGroups) {
    const expressions = group.map(({ dataType, name }) =>
      dataType === "object date" ? `date_trunc('milliseconds', ${quoteIdentifier(name)})` : quoteIdentifier(name),
    );
    const [result] = await source.unsafe<{ duplicates: string }[]>(
      `SELECT count(*) AS duplicates FROM (SELECT 1 FROM ${quoteIdentifier(table.pgSchema)}.${quoteIdentifier(table.pgTable)} GROUP BY ${expressions.join(", ")} HAVING count(*) > 1) AS duplicated`,
    );
    if (Number(result?.duplicates ?? 0) > 0)
      throw new InvalidOperationError(
        Operation.Read,
        table.name,
        `has rows that collide at millisecond precision on ${group.map(({ name }) => name).join(", ")}`,
      );
  }
};
