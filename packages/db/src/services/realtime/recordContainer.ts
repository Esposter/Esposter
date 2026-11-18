import type { SQLWrapper } from "drizzle-orm";

import { checkIsStatement } from "#src/services/realtime/checkIsStatement";
import { recordStatement } from "#src/services/realtime/recordStatement";

// An object that hands out queries, such as the database or its relational `query` tables. A method that returns a
// Query returns it recorded, and an object it holds is one too, so `db.query.rooms.findFirst()` is recorded
export const recordContainer = <T extends object>(container: T, record: (statement: SQLWrapper) => void): T =>
  new Proxy(container, {
    get: (target, property) => {
      const value: unknown = Reflect.get(target, property, target);
      if (typeof value === "function")
        return (...args: unknown[]) => {
          const result: unknown = Reflect.apply(value, target, args);
          return checkIsStatement(result) ? recordStatement(result, record) : result;
        };
      if (typeof value === "object" && value !== null && !(value instanceof Promise) && !checkIsStatement(value))
        return recordContainer(value, record);
      return value;
    },
  });
