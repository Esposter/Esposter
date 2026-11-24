import type { Recorder } from "#src/models/realtime/Recorder";
import type { Database } from "@esposter/db-schema";

import { batchStatements } from "#src/services/realtime/batchStatements";
import { checkIsStatement } from "#src/services/realtime/checkIsStatement";
import { getBeforeReads } from "#src/services/realtime/getBeforeReads";
import { getBeforeRows } from "#src/services/realtime/getBeforeRows";
import { answerReturned, widenUnreturnedWrite } from "#src/services/realtime/widenReturning";
import { noop } from "@esposter/shared";

// `batch` runs the statements it is handed without awaiting them, so each one is recorded when the batch is made. A
// Write that needs reads before it runs has them placed ahead of it in the same batch, and each statement's rows and
// Its reads' rows are handed to its record once the batch resolves. The batch resolves to the results of its own
// Statements alone
export const recordBatch =
  (recorder: Recorder) =>
  async (...args: Parameters<Database["batch"]>) => {
    const [statements] = args;
    const items: unknown[] = [];
    const placed = statements.map((statement: unknown) => {
      if (!checkIsStatement(statement)) {
        items.push(statement);
        return {
          answer: (result: unknown) => result,
          complete: noop,
          index: items.length - 1,
          reads: [],
          readStart: 0,
        };
      }
      const reads = getBeforeReads(recorder.database, statement);
      const readStart = items.length;
      items.push(...reads.map(({ select }) => select));
      const executed = widenUnreturnedWrite(statement);
      const complete = recorder.record(executed.statement);
      items.push(executed.statement);
      return {
        answer: (result: unknown) => (executed.answer ? executed.answer(result) : answerReturned(statement, result)),
        complete,
        index: items.length - 1,
        reads,
        readStart,
      };
    });
    const results = await batchStatements(recorder.database, items);
    return placed.map(({ answer, complete, index, reads, readStart }) => {
      const result = results[index];
      complete(result, getBeforeRows(reads, results, readStart));
      return answer(result);
    });
  };
