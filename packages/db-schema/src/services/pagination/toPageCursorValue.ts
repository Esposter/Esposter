import { InvalidOperationError, Operation } from "@esposter/shared";

// A sort value as the cursor holds it and as SQLite compares it: a date as its millisecond number, which is how a
// Timestamp column stores it. A sort key is a NOT NULL number, string or date column, so anything else is a sort declared
// Over the wrong column
export const toPageCursorValue = (value: unknown): number | string => {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number" || typeof value === "string") return value;
  throw new InvalidOperationError(Operation.Read, toPageCursorValue.name, String(value));
};
