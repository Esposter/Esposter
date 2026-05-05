import type { ResultAsync } from "neverthrow";

export const withFinalizer = async <T, E>(
  resultAsync: ResultAsync<T, E>,
  finalizer: () => ResultAsync<unknown, unknown>,
): Promise<T> => {
  const result = await resultAsync;
  const finalizerResult = await finalizer();
  finalizerResult.match(
    () => {},
    (error) => console.error(error),
  );
  return result._unsafeUnwrap();
};
