import { toAppError } from "@/services/error/toAppError";
import { ResultAsync } from "neverthrow";

export const getResultAsync = <T>(fn: () => Promise<T>): ResultAsync<T, Error> =>
  ResultAsync.fromPromise(fn(), toAppError);
