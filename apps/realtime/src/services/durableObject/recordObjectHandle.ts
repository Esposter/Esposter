import type { RecordedDatabase } from "@esposter/db";
import type { Database } from "@esposter/db-schema";

import { recordStatements } from "@esposter/db";
import { AsyncLocalStorage } from "node:async_hooks";

// The recorder of one handle in an invocation. An owned handle is the object's own database, whose rows belong to the object
// Alone, so its topics name the object
export interface ObjectHandleRecord {
  owned: boolean;
  recorder: RecordedDatabase;
}

// The recorded handles of one invocation, by the handle each was made over. A handle an invocation never reads is never recorded
export type ObjectInvocationHandles = Map<object, ObjectHandleRecord>;

// The scope an invocation runs in. An object's handles read it when a statement runs, so the statements the invocation's
// Method awaits are recorded into its own handles and none of another invocation's
export const objectInvocationStorage = new AsyncLocalStorage<ObjectInvocationHandles>();

// The handle an object reads and writes through, whether its SQLite (drizzle's durable-sqlite builder) or the core D1. Inside
// An invocation it is that invocation's recorded handle for the same database; outside one it is the database itself, so
// An alarm or a constructor's statement is not recorded. The recorder types its handle over D1, which an object's SQLite
// Handle is not, but it records both the same way (the recorder only wraps the methods a statement is built from)
export const createObjectHandle = <T extends object>(handle: T, { owned = false }: { owned?: boolean } = {}): T =>
  new Proxy(handle, {
    get: (target, property) => {
      const invocationHandles = objectInvocationStorage.getStore();
      let database: object = target;
      if (invocationHandles) {
        let record = invocationHandles.get(target);
        if (!record) {
          // The forced conversion: the recorder's handle type is D1's, and the recorder treats both alike
          record = { owned, recorder: recordStatements(target as Database) };
          invocationHandles.set(target, record);
        }
        database = record.recorder.database;
      }
      const value: unknown = Reflect.get(database, property, database);
      return typeof value === "function" ? value.bind(database) : value;
    },
  });
