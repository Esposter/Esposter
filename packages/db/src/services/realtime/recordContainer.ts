import type { RecordStatement } from "#src/models/realtime/RecordStatement";

import { checkIsStatement } from "#src/services/realtime/checkIsStatement";
import { recordStatement } from "#src/services/realtime/recordStatement";

// An object that hands out queries, such as the database or its relational `query` tables. A method that returns a
// Query returns it recorded, and an object it holds is one too, so `db.query.rooms.findFirst()` is recorded
export const recordContainer = <T extends object>(container: T, record: RecordStatement): T =>
  new Proxy(container, {
    get: (target, property) => {
      const value: unknown = Reflect.get(target, property, target);
      if (typeof value === "function")
        return (...args: unknown[]) => recordResult(Reflect.apply(value, target, args), record);
      if (typeof value === "object" && value !== null && !(value instanceof Promise) && !checkIsStatement(value))
        return recordContainer(value, record);
      return value;
    },
  });

// A builder is not a query until its last step, so a builder a method returns is wrapped too, and the query its next
// Step returns is recorded in turn. Anything else is returned as it is
const recordResult = (result: unknown, record: RecordStatement): unknown => {
  if (checkIsStatement(result)) return recordStatement(result, record);
  if (typeof result === "object" && result !== null && !(result instanceof Promise) && !Array.isArray(result))
    return recordContainer(result, record);
  return result;
};
