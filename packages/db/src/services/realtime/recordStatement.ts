import type { SQLWrapper } from "drizzle-orm";

import { checkIsStatement } from "#src/services/realtime/checkIsStatement";

// A query that records itself when it is awaited. `then` is where a query runs from, so the record is made there.
// The query's other methods run on the query they came from, and a query one of them returns is recorded in turn, so a
// Chain is recorded once, at its end. `catch` and `finally` run with the recorded query as `this`, so the `then` they
// Call is the recorded one
export const recordStatement = <T extends PromiseLike<unknown> & SQLWrapper>(
  statement: T,
  record: (statement: SQLWrapper) => void,
): T => {
  const recorded: T = new Proxy(statement, {
    get: (target, property) => {
      if (property === "then")
        return (...args: unknown[]) => {
          record(target);
          return Reflect.apply(target.then, target, args);
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
