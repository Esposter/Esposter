import type { SQLWrapper } from "drizzle-orm";

// A drizzle query that runs when it is awaited. Each query class takes `then` from QueryPromise by a mixin, not by
// Inheritance, so `instanceof` cannot name it. What every one of them has is a `then` and the SQL it builds
export const checkIsStatement = (value: unknown): value is PromiseLike<unknown> & SQLWrapper =>
  typeof value === "object" &&
  value !== null &&
  "then" in value &&
  typeof value.then === "function" &&
  "getSQL" in value &&
  typeof value.getSQL === "function";
