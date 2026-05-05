import type { Promisable } from "type-fest";

import { getResultAsync } from "@esposter/shared";

export const withFinalizer = async <T>(fn: () => Promisable<T>, finalizer?: () => Promisable<void>): Promise<T> => {
  const runFinalizer = finalizer
    ? () => getResultAsync(() => Promise.resolve(finalizer())).match(() => undefined, console.error)
    : undefined;
  const result = await getResultAsync(() => Promise.resolve(fn()));
  await runFinalizer?.();
  return result.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
};
