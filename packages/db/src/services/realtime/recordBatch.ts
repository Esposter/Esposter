import type { Database } from "@esposter/db-schema";
import type { SQLWrapper } from "drizzle-orm";

import { checkIsStatement } from "#src/services/realtime/checkIsStatement";

// `batch` runs the statements it is handed without awaiting them, so each one is recorded when the batch is made. Its
// Statements are drizzle's own builders, each a statement, so the guard only narrows the type
export const recordBatch =
  (database: Database, record: (statement: SQLWrapper) => void) =>
  (...args: Parameters<Database["batch"]>) => {
    const [statements] = args;
    for (const statement of statements) if (checkIsStatement(statement)) record(statement);
    return database.batch(...args);
  };
