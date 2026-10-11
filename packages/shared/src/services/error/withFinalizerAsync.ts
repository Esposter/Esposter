/* oxlint-disable typescript/require-await -- async wrappers intentional: converts sync throws into rejections so ResultAsync.fromPromise captures them */
import type { Promisable } from "type-fest";

import { getResultAsync } from "#src/services/error/getResultAsync";
import { reportFinalizerError } from "#src/services/error/reportFinalizerError";
import { noop } from "#src/util/function/noop";

export const withFinalizerAsync = async <T>(
  callback: () => Promisable<T>,
  finalizer?: () => Promisable<void>,
): Promise<T> => {
  const callbackResult = await getResultAsync(async () => callback());
  if (finalizer)
    await getResultAsync(async () => finalizer()).match(noop, (error) => {
      reportFinalizerError(callbackResult, error);
    });
  return callbackResult.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
};
