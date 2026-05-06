/* oxlint-disable require-await -- async wrappers intentional: converts sync throws into rejections so ResultAsync.fromPromise captures them */
import type { Promisable } from "type-fest";

import { getResultAsync } from "@/services/error/getResultAsync";
import { noop } from "@/util/function/noop";

export const withFinalizerAsync = async <T>(
  fn: () => Promisable<T>,
  finalizer?: () => Promisable<void>,
): Promise<T> => {
  const runFinalizer = finalizer ? () => getResultAsync(async () => finalizer()).match(noop, console.error) : undefined;
  const result = await getResultAsync(async () => fn());
  await runFinalizer?.();
  return result.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
};
