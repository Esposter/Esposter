import type { Recorder } from "#src/models/realtime/Recorder";

import { checkIsStatement } from "#src/services/realtime/checkIsStatement";
import { recordStatement } from "#src/services/realtime/recordStatement";
import { checkIsFunction } from "#src/util/function/checkIsFunction";
import { is } from "drizzle-orm";
import { SQLiteAsyncTransaction } from "drizzle-orm/sqlite-core";

// An object that hands out queries, such as the database or its relational `query` tables. A method that returns a
// Query returns it recorded, and an object it holds is one too, so `db.query.rooms.findFirst()` is recorded. A callback
// A method is given has the handles it is called with recorded in turn, so a `transaction` callback's transaction is
// Too
export const recordContainer = <T extends object>(container: T, recorder: Recorder): T =>
  new Proxy(container, {
    get: (target, property) => {
      const value: unknown = Reflect.get(target, property, target);
      if (typeof value === "function")
        return (...args: unknown[]) =>
          recordResult(
            Reflect.apply(
              value,
              target,
              args.map((arg) => (checkIsFunction(arg) ? recordCallback(arg, recorder) : arg)),
            ),
            recorder,
          );
      if (typeof value === "object" && value !== null && !(value instanceof Promise) && !checkIsStatement(value))
        return recordContainer(value, recorder);
      return value;
    },
  });

// The callback is called as it was, with its transaction recorded. A transaction is a handle of the database it came
// From, so a statement run on it is recorded as one the database ran
const recordCallback = (callback: (...args: unknown[]) => unknown, recorder: Recorder) =>
  function (this: unknown, ...args: unknown[]): unknown {
    return Reflect.apply(
      callback,
      this,
      args.map((arg) => (is(arg, SQLiteAsyncTransaction) ? recordContainer(arg, recorder) : arg)),
    );
  };

// A builder is not a query until its last step, so a builder a method returns is wrapped too, and the query its next
// Step returns is recorded in turn. Anything else is returned as it is
const recordResult = (result: unknown, recorder: Recorder): unknown => {
  if (checkIsStatement(result)) return recordStatement(result, recorder);
  if (typeof result === "object" && result !== null && !(result instanceof Promise) && !Array.isArray(result))
    return recordContainer(result, recorder);
  return result;
};
