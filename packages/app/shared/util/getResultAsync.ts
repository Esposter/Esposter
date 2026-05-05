import { toAppError } from "@esposter/shared";
import { ResultAsync } from "neverthrow";

export const getResultAsync = <T>(fn: () => PromiseLike<T> | T): ResultAsync<T, Error> =>
  ResultAsync.fromThrowable(async () => fn(), toAppError)();
