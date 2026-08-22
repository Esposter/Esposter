import { toAppError } from "@/services/error/toAppError";
import { ResultAsync } from "neverthrow";

export const getResultAsync = <T>(fn: () => Promise<T>): ResultAsync<T, Error> =>
  // This is the replacement the ban points at, and `then` is what turns a callback throwing SYNCHRONOUSLY into
  // A rejected promise `fromPromise` can map into an Err
  // eslint-disable-next-line no-restricted-syntax -- the primitive the ban is written in terms of
  ResultAsync.fromPromise(Promise.resolve().then(fn), toAppError);
