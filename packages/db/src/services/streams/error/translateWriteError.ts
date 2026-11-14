import { StreamTableError } from "#src/models/streams/StreamTableError";

// D1 names the constraint a write broke in its message, and Drizzle wraps that error with the statement as its own
// message, so the cause chain is read. A unique key that is already there is an existing row. The etag guard of a batch
// inserts a row with a null entity, so its refusal is a null constraint: a stale etag is named by that, not by the
// duplicate key the same insert would also break
const getMessages = (error: unknown): string[] =>
  error instanceof Error ? [error.message, ...getMessages(error.cause)] : [];

export const translateWriteError = (error: unknown): unknown => {
  const messages = getMessages(error);
  if (messages.some((message) => message.includes("NOT NULL constraint failed")))
    return new StreamTableError("etagMismatch");
  else if (messages.some((message) => message.includes("UNIQUE constraint failed")))
    return new StreamTableError("exists");
  else return error;
};
