import type { RecordedRows } from "#src/models/realtime/RecordedRows";
import type { Recorder } from "#src/models/realtime/Recorder";
import type { BeforeRead } from "#src/services/realtime/getBeforeReads";
import type { SQLWrapper } from "drizzle-orm";

import { batchStatements } from "#src/services/realtime/batchStatements";
import { checkIsStatement } from "#src/services/realtime/checkIsStatement";
import { getBeforeReads } from "#src/services/realtime/getBeforeReads";
import { toRows } from "#src/services/realtime/toRows";
import { getResultAsync } from "@esposter/shared";

// A query that records itself when it is awaited. `then` is where a query runs from, so the record is made there, and the
// Rows it resolves to are handed to the record before the awaiting caller sees them. A write that needs reads before it runs
// Runs them in the same batch, ahead of it, so they see the rows as the write does. The query's other methods run on the
// Query they came from, and a query one of them returns is recorded in turn, so a chain is recorded once, at its end.
// `catch` and `finally` run with the recorded query as `this`, so the `then` they call is the recorded one
// Runs a statement with the reads it needs before it, and returns what it resolved to with the rows of those reads. The
// Statement awaited alone is run as it is, so its own `then` runs it
const runStatement = async (
  recorder: Recorder,
  statement: PromiseLike<unknown> & SQLWrapper,
  reads: BeforeRead[],
): Promise<{ before: RecordedRows[]; result: unknown }> => {
  if (reads.length === 0) return { before: [], result: await statement };
  const results = await batchStatements(recorder.database, [...reads.map(({ select }) => select), statement]);
  return {
    before: reads.map(({ table }, index) => ({ rows: toRows(results[index]), table })),
    result: results[reads.length],
  };
};

// The methods a synchronous statement runs by: a query's rows (`all`, `get`) or its write (`run`)
const SYNC_EXECUTE_METHODS = new Set(["all", "get", "run"]);

export const recordStatement = <T extends PromiseLike<unknown> & SQLWrapper>(statement: T, recorder: Recorder): T => {
  const recorded: T = new Proxy(statement, {
    get: (target, property) => {
      if (property === "then")
        return (
          onFulfilled?: ((value: unknown) => unknown) | null,
          onRejected?: ((reason: unknown) => unknown) | null,
        ) => {
          const complete = recorder.record(target);
          const reads = getBeforeReads(recorder.database, target);
          return getResultAsync(() => runStatement(recorder, target, reads)).match(
            ({ before, result }) => {
              complete(result, before);
              return onFulfilled ? onFulfilled(result) : result;
            },
            (error) => {
              if (onRejected) return onRejected(error);
              throw error;
            },
          );
        };

      const value: unknown = Reflect.get(target, property, target);
      if (typeof value !== "function") return value;
      // A synchronous execution, as a Durable Object's SQLite runs its statements: the statement runs when it is called, so it
      // Is recorded there, with the rows it returned. A write answers its run result, which names no row
      if (typeof property === "string" && SYNC_EXECUTE_METHODS.has(property))
        return (...args: unknown[]) => {
          const complete = recorder.record(target);
          const result: unknown = Reflect.apply(value, target, args);
          complete(property === "run" ? undefined : result, []);
          return result;
        };
      const self = property === "catch" || property === "finally" ? recorded : target;
      return (...args: unknown[]) => {
        const result: unknown = Reflect.apply(value, self, args);
        return checkIsStatement(result) ? recordStatement(result, recorder) : result;
      };
    },
  });
  return recorded;
};
