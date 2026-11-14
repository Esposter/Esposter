import type { D1Executor } from "#src/models/cutover/D1Executor";

import { InvalidOperationError, Operation } from "@esposter/shared";

// `PRAGMA foreign_key_check` returns one row per violation, naming its table and rowid and never the values.
// So a failure says where to look without copying any personal data into the log
export const verifyForeignKeys = async (executor: D1Executor): Promise<void> => {
  const violations = await executor.query({ params: [], sql: "PRAGMA foreign_key_check" });
  const [first] = violations;
  if (first)
    throw new InvalidOperationError(
      Operation.Read,
      String(first.table),
      `${violations.length} rows reference a parent that does not exist, first in rowid ${String(first.rowid)}`,
    );
};
