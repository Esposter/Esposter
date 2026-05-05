import type { ResultAsync } from "neverthrow";

export const withFinalizer = async <T, E>(
  resultAsync: ResultAsync<T, E>,
  finalizer: () => ResultAsync<unknown, unknown>,
): Promise<T> => {
  const result = await resultAsync;
  const finalizerResult = await finalizer();
  if (finalizerResult.isErr()) console.error(finalizerResult.error);
  return result._unsafeUnwrap();
};
