import { getResultAsync } from "#shared/error/getResultAsync";
import { withFinalizer } from "#shared/error/withFinalizer";
import { describe } from "vitest";

export const withAsyncIterator = <T, R>(
  createIterator: () => AsyncIterable<T>,
  fn: (iterator: AsyncIterator<T>) => Promise<R>,
): Promise<R> => {
  const iterator = createIterator()[Symbol.asyncIterator]();
  return withFinalizer(
    getResultAsync(() => fn(iterator)),
    () => getResultAsync(() => iterator.return?.()),
  );
};

describe.todo("withAsyncIterator");
