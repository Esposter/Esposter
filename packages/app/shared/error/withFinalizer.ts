import { getResultAsync } from "#shared/error/getResultAsync";
import { toAppError } from "@esposter/shared";

export const withFinalizer = async <T>(
  fn: () => PromiseLike<T> | T,
  finalizer: () => PromiseLike<unknown> | unknown,
): Promise<T> => {
  const runFinalizer = () => getResultAsync(finalizer).match(() => undefined, console.error);
  const result = await getResultAsync(fn);
  await runFinalizer();
  return result.match(
    (value) => value,
    (error) => {
      throw toAppError(error);
    },
  );
};
