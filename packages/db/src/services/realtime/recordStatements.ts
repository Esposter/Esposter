import type { RecordedDatabase } from "#src/models/realtime/RecordedDatabase";
import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { Recorder } from "#src/models/realtime/Recorder";
import type { RecordStatement } from "#src/models/realtime/RecordStatement";
import type { Database } from "@esposter/db-schema";

import { recordBatch } from "#src/services/realtime/recordBatch";
import { recordContainer } from "#src/services/realtime/recordContainer";
import { toRows } from "#src/services/realtime/toRows";

// The handle a request reads and writes through. It is made per request, so the statements a request awaits are its
// Own, and nothing in drizzle is patched to make it, so another request on the same classes records nothing
export const recordStatements = (database: Database): RecordedDatabase => {
  const statements: RecordedStatement[] = [];
  const record: RecordStatement = (statement) => {
    const recordedStatement: RecordedStatement = { before: [], rows: [], statement };
    statements.push(recordedStatement);
    return (result, before) => {
      recordedStatement.before = before;
      recordedStatement.rows = toRows(result);
    };
  };
  const recorder: Recorder = { database, record };
  const container = recordContainer(database, recorder);
  const recordedDatabase: Database = new Proxy(container, {
    get: (target, property, receiver) =>
      property === "batch" ? recordBatch(recorder) : Reflect.get(target, property, receiver),
  });
  return { database: recordedDatabase, statements };
};
