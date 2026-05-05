/* eslint-disable require-await -- async wrappers intentional: converts sync throws into rejections so ResultAsync.fromPromise captures them */
import type { Promisable } from "type-fest";

import { getResultAsync } from "@esposter/shared";

export const withFinalizer = async <T>(fn: () => Promisable<T>, finalizer?: () => Promisable<void>): Promise<T> => {
  const runFinalizer = finalizer
    ? () => getResultAsync(async () => finalizer()).match(() => undefined, console.error)
    : undefined;
  const result = await getResultAsync(async () => fn());
  await runFinalizer?.();
  return result.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
};
