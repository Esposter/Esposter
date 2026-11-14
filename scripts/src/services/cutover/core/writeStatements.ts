import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { D1Statement } from "#src/models/cutover/D1Statement";

import { D1_BATCH_STATEMENT_COUNT, DEFER_FOREIGN_KEYS_STATEMENT } from "#src/services/cutover/constants";

// Sends statements in batches, each starting with `PRAGMA defer_foreign_keys`: the batch is one transaction.
// A foreign key may therefore be checked at its commit rather than at its insert
export const writeStatements = async (executor: D1Executor, statements: D1Statement[]): Promise<void> => {
  for (let index = 0; index < statements.length; index += D1_BATCH_STATEMENT_COUNT)
    // oxlint-disable-next-line no-await-in-loop -- committed prefix: each batch commits before the next is sent, so a failure stops the batches behind it
    await executor.batch([
      { params: [], sql: DEFER_FOREIGN_KEYS_STATEMENT },
      ...statements.slice(index, index + D1_BATCH_STATEMENT_COUNT),
    ]);
};
