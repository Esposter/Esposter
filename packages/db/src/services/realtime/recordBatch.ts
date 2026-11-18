import type { RecordStatement } from "#src/models/realtime/RecordStatement";
import type { Database } from "@esposter/db-schema";

import { checkIsStatement } from "#src/services/realtime/checkIsStatement";
import { noop } from "@esposter/shared";

// `batch` runs the statements it is handed without awaiting them, so each one is recorded when the batch is made. Its
// Statements are drizzle's own builders, each a statement, so the guard only narrows the type. The batch resolves each
// Statement's rows in the order they were handed, so each one's rows are handed to its record once the batch resolves
export const recordBatch =
  (database: Database, record: RecordStatement) =>
  async (...args: Parameters<Database["batch"]>) => {
    const [statements] = args;
    const completes: ((result: unknown) => void)[] = [];
    for (const statement of statements) completes.push(checkIsStatement(statement) ? record(statement) : noop);
    const results = await database.batch(...args);
    for (const [index, complete] of completes.entries()) complete(results[index]);
    return results;
  };
