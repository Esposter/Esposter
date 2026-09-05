import { toAppError } from "#src/services/error/toAppError";
import { ResultAsync } from "neverthrow";
// `fromThrowable` awaits `fn` inside its own `try`, so a callback that throws SYNCHRONOUSLY lands in the
// Same Err as one whose promise rejects
export const getResultAsync = <T>(fn: () => Promise<T>): ResultAsync<T, Error> =>
  ResultAsync.fromThrowable(fn, toAppError)();
