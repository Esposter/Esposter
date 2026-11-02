import { toAppError } from "#src/services/error/toAppError";
import { takeOne } from "#src/util/array/takeOne";

// A lone rejection is rethrown as it was thrown, so its caller keeps the exact error it had. Several are carried
// Together under the first one's message: a failure whose other reasons were dropped can only be diagnosed from
// Whichever one happened to settle first. Nothing is thrown for an empty list
export const rethrowRejections = (reasons: unknown[]): void => {
  if (reasons.length === 1) throw takeOne(reasons);
  else if (reasons.length > 1) throw new AggregateError(reasons, toAppError(takeOne(reasons)).message);
};
