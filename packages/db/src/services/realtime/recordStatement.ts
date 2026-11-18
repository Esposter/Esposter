import type { RecordStatement } from "#src/models/realtime/RecordStatement";
import type { SQLWrapper } from "drizzle-orm";

import { checkIsStatement } from "#src/services/realtime/checkIsStatement";

// A query that records itself when it is awaited. `then` is where a query runs from, so the record is made there, and the
// Rows it resolves to are handed to the record before the awaiting caller sees them. The query's other methods run on the
// Query they came from, and a query one of them returns is recorded in turn, so a chain is recorded once, at its end.
// `catch` and `finally` run with the recorded query as `this`, so the `then` they call is the recorded one
export const recordStatement = <T extends PromiseLike<unknown> & SQLWrapper>(
  statement: T,
  record: RecordStatement,
): T => {
  const recorded: T = new Proxy(statement, {
    get: (target, property) => {
      if (property === "then")
        return (
          onFulfilled?: ((value: unknown) => unknown) | null,
          onRejected?: ((reason: unknown) => unknown) | null,
        ) => {
          const complete = record(target);
          return Reflect.apply(target.then, target, [
            (result: unknown) => {
              complete(result);
              return onFulfilled ? onFulfilled(result) : result;
            },
            onRejected,
          ]);
        };

      const value: unknown = Reflect.get(target, property, target);
      if (typeof value !== "function") return value;
      const self = property === "catch" || property === "finally" ? recorded : target;
      return (...args: unknown[]) => {
        const result: unknown = Reflect.apply(value, self, args);
        return checkIsStatement(result) ? recordStatement(result, record) : result;
      };
    },
  });
  return recorded;
};
