import { describe } from "vitest";

import { getResultAsync } from "#shared/util/getResultAsync";
import { withFinalizer } from "#shared/util/withFinalizer";

export const withAsyncIterator = async <T, R>(
  createIterator: () => AsyncIterable<T>,
  fn: (iterator: AsyncIterator<T>) => Promise<R>,
): Promise<R> => {
  const iterator = createIterator()[Symbol.asyncIterator]();
  return withFinalizer(
    getResultAsync(() => fn(iterator)),
    () => getResultAsync(async () => iterator.return?.()),
  );
};

describe.todo("withAsyncIterator");
