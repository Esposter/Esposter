import { toAppError } from "@esposter/shared";

export const withFinalizer = async <T>(fn: () => PromiseLike<T>, finalizer: () => PromiseLike<unknown>): Promise<T> => {
  const runFinalizer = () => getResultAsync(Promise.resolve(finalizer())).match(() => undefined, console.error);
  const result = await getResultAsync(Promise.resolve(fn()));
  await runFinalizer();
  return result.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
};
