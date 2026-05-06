/* oxlint-disable require-await -- async wrappers intentional: converts sync throws into rejections so ResultAsync.fromPromise captures them */
import type { Promisable } from "type-fest";

import { getResultAsync } from "@/services/error/getResultAsync";
import { noop } from "@/util/function/noop";

export const withFinalizerAsync = async <T>(
  fn: () => Promisable<T>,
  finalizer?: () => Promisable<void>,
): Promise<T> => {
  // eslint-disable-next-line neverthrow/must-use-result -- result.isOk() is checked in finalizer before result.match() consumes it
  const result = await getResultAsync(async () => fn());
  if (finalizer)
    await getResultAsync(async () => finalizer()).match(noop, (error) => {
      if (result.isOk()) throw error;
      console.error(error);
    });
  return result.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
};
