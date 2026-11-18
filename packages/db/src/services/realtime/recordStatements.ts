import type { RecordedDatabase } from "#src/models/realtime/RecordedDatabase";
import type { Database } from "@esposter/db-schema";
import type { SQLWrapper } from "drizzle-orm";

import { recordBatch } from "#src/services/realtime/recordBatch";
import { recordContainer } from "#src/services/realtime/recordContainer";

// The handle a request reads and writes through. It is made per request, so the statements a request awaits are its
// Own, and nothing in drizzle is patched to make it, so another request on the same classes records nothing
export const recordStatements = (database: Database): RecordedDatabase => {
  const statements: SQLWrapper[] = [];
  const record = (statement: SQLWrapper) => {
    statements.push(statement);
  };
  const container = recordContainer(database, record);
  const recordedDatabase: Database = new Proxy(container, {
    get: (target, property, receiver) =>
      property === "batch" ? recordBatch(database, record) : Reflect.get(target, property, receiver),
  });
  return { database: recordedDatabase, statements };
};
