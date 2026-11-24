import type { RecordedRows } from "#src/models/realtime/RecordedRows";
import type { Recorder } from "#src/models/realtime/Recorder";
import type { BeforeRead } from "#src/services/realtime/getBeforeReads";
import type { SQLWrapper } from "drizzle-orm";

import { batchStatements } from "#src/services/realtime/batchStatements";
import { checkIsStatement } from "#src/services/realtime/checkIsStatement";
import { getBeforeReads } from "#src/services/realtime/getBeforeReads";
import { getBeforeRows } from "#src/services/realtime/getBeforeRows";
import { getWriteTable } from "#src/services/realtime/getWriteTable";
import {
  answerReturned,
  statementAnswerMap,
  widenReturning,
  widenUnreturnedWrite,
} from "#src/services/realtime/widenReturning";
import { checkIsRecord, getResultAsync } from "@esposter/shared";

// A write that asks for no RETURNING is widened to name its rows, and it runs through `run`, the method its
// Caller awaited. whatever holds that method holds the write too. D1's `run` answers the rows a RETURNING statement
// Names as `results`
const runWidenedWrite = async (statement: PromiseLike<unknown> & SQLWrapper): Promise<unknown> => {
  const run: unknown = await Reflect.apply(Reflect.get(statement, "run", statement), statement, []);
  return checkIsRecord(run) ? run.results : undefined;
};

// Runs a statement with the reads it needs before it, and returns what it resolved to with the rows of those reads. The
// Statement awaited alone is run as it is, so its own `then` runs it
const runStatement = async (
  recorder: Recorder,
  executed: ReturnType<typeof widenUnreturnedWrite>,
  reads: BeforeRead[],
): Promise<{ before: RecordedRows[]; result: unknown }> => {
  if (reads.length === 0)
    return {
      before: [],
      result: executed.answer ? await runWidenedWrite(executed.statement) : await executed.statement,
    };
  const results = await batchStatements(recorder.database, [...reads.map(({ select }) => select), executed.statement]);
  return { before: getBeforeRows(reads, results, 0), result: results[reads.length] };
};

// The methods a synchronous statement runs by: a query's rows (`all`, `get`) or its write (`run`)
const SYNC_EXECUTE_METHODS = new Set(["all", "get", "run"]);

// A query that records itself when it is awaited. `then` is where a query runs from, so the record is made there, and
// The rows it resolves to are handed to the record before the awaiting caller sees them. A write that needs reads
// Before it runs runs them in the same batch, ahead of it, so they see the rows as the write does. The query's other
// Methods run on the query they came from, and a query one of them returns is recorded in turn, so a chain is recorded
// Once, at its end. `catch` and `finally` run with the recorded query as `this`, so the `then` they call is the
// Recorded one
export const recordStatement = <T extends PromiseLike<unknown> & SQLWrapper>(statement: T, recorder: Recorder): T => {
  const recorded: T = new Proxy(statement, {
    get: (target, property) => {
      if (property === "then")
        return (
          onFulfilled?: ((value: unknown) => unknown) | null,
          onRejected?: ((reason: unknown) => unknown) | null,
        ) => {
          const executed = widenUnreturnedWrite(target);
          const complete = recorder.record(executed.statement);
          const reads = getBeforeReads(recorder.database, target);
          return getResultAsync(() => runStatement(recorder, executed, reads)).match(
            ({ before, result }) => {
              complete(result, before);
              const answer = executed.answer ? executed.answer(result) : answerReturned(recorded, result);
              return onFulfilled ? onFulfilled(answer) : answer;
            },
            (error) => {
              if (onRejected) return onRejected(error);
              throw error;
            },
          );
        };

      const value: unknown = Reflect.get(target, property, target);
      if (typeof value !== "function") return value;
      // A write's RETURNING is widened with its table's scope columns before it runs, so the rows it names carry them
      if (property === "returning")
        return (...args: unknown[]) => {
          const table = getWriteTable(target);
          const widened = table && checkIsRecord(args[0]) ? widenReturning(table, args[0]) : undefined;
          const result: unknown = Reflect.apply(value, target, widened ? [widened.fields] : args);
          if (!checkIsStatement(result)) return result;
          const returned = recordStatement(result, recorder);
          if (widened?.answer) statementAnswerMap.set(returned, widened.answer);
          return returned;
        };
      // A synchronous execution, as a Durable Object's SQLite runs its statements: the statement runs when it is
      // Called, so it is recorded there, with the rows it returned. A write answers its run result, which names no row
      if (typeof property === "string" && SYNC_EXECUTE_METHODS.has(property))
        return (...args: unknown[]) => {
          // A write `run()` executes asks for no rows, so it runs as the rows it changes and answers none
          const widened = property === "run" ? widenUnreturnedWrite(target) : undefined;
          if (widened?.answer) {
            const complete = recorder.record(widened.statement);
            complete(
              Reflect.apply(Reflect.get(widened.statement, "all", widened.statement), widened.statement, []),
              [],
            );
            return undefined;
          }
          const complete = recorder.record(target);
          const result: unknown = Reflect.apply(value, target, args);
          if (property === "run") {
            complete(undefined, []);
            return result;
          }
          complete(result, []);
          return answerReturned(recorded, result);
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
