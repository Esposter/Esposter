import type { Result, ResultAsync } from "neverthrow";

import { toAppError } from "@esposter/shared";

export const withFinalizer = async <T, E>(
  resultAsync: ResultAsync<T, E>,
  finalizer: () => ResultAsync<unknown, unknown>,
): Promise<T> => {
  const runFinalizer = () => finalizer().match(() => {}, console.error);
  let result: Result<T, E>;
  try {
    result = await resultAsync;
  } catch (error) {
    await runFinalizer();
    throw error;
  }
  await runFinalizer();
  return result.match(
    (value) => value,
    (error) => {
      throw toAppError(error);
    },
  );
};
