import type { Database } from "@esposter/db-schema";

import { db } from "#server/db/index";
import { AsyncLocalStorage } from "node:async_hooks";

// The request scope: a request that records its writes runs in it, with its recorded handle as the value
export const requestDbStorage = new AsyncLocalStorage<Database>();

// The handle a statement runs through: the request's recorded handle when a request is in scope, so the statement's
// Writes Are named with the request's. Outside one it is the D1 handle itself
const getRequestDb = () => requestDbStorage.getStore() ?? db;

// The handle better-auth writes through. Its instance is built once for every request, so each call reads the handle of
// The request it serves when the call runs, not when the instance is built. A function is bound to the handle it was
// Read From, so its `this` is that handle and not this proxy
export const requestDatabase: Database = new Proxy(db, {
  get: (_target, key) => {
    const current = getRequestDb();
    const value: unknown = Reflect.get(current, key, current);
    return typeof value === "function" ? value.bind(current) : value;
  },
});
