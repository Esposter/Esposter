import { describe } from "vitest";

export const withAsyncIterator = async <T, R>(
  createIterator: () => AsyncIterable<T>,
  fn: (iterator: AsyncIterator<T>) => Promise<R>,
): Promise<R> => {
  const iterator = createIterator()[Symbol.asyncIterator]();
  try {
    return await fn(iterator);
  } finally {
    await iterator.return?.();
  }
};

describe.todo("withAsyncIterator");
