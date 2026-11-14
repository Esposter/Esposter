import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { SourceClient } from "#src/models/cutover/SourceClient";

import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Postgres keeps microseconds and D1 milliseconds, so two rows that differ only below a millisecond collide once copied.
// The source is checked at the precision D1 will hold, before a copy whose unique index would reject the second row
export const checkTimestampUniqueIndexes = async (source: SourceClient, table: CoreTable): Promise<void> => {
  for (const group of table.timestampUniqueColumnGroups) {
    const expressions = group.map(({ dataType, name }) =>
      dataType === "object date" ? `date_trunc('milliseconds', ${quoteIdentifier(name)})` : quoteIdentifier(name),
    );
    // oxlint-disable-next-line no-await-in-loop -- stop at the first: a group whose rows collide throws before the groups behind it are queried
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
