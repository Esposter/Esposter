import { withFinalizerAsync } from "@esposter/shared";
import { describe } from "vitest";

export const withAsyncIterator = <T, R>(
  createIterator: () => AsyncIterable<T>,
  fn: (iterator: AsyncIterator<T>) => Promise<R>,
): Promise<R> => {
  const iterator = createIterator()[Symbol.asyncIterator]();
  return withFinalizerAsync(
    () => fn(iterator),
    async () => {
      await iterator.return?.();
    },
  );
};

describe.todo("withAsyncIterator");
