import { withFinalizerAsync } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

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

const createIterator = (returnFn: () => Promise<IteratorResult<unknown>>) => () => ({
  [Symbol.asyncIterator]() {
    return { next: vi.fn<() => Promise<IteratorResult<unknown>>>(), return: returnFn };
  },
});

describe(withAsyncIterator, () => {
  test("calls iterator.return() when fn resolves", async () => {
    expect.hasAssertions();

    const returnFn = vi.fn<() => Promise<IteratorResult<unknown>>>();
    await withAsyncIterator(createIterator(returnFn), () => Promise.resolve("result"));

    expect(returnFn).toHaveBeenCalledTimes(1);
  });

  test("calls iterator.return() when fn rejects", async () => {
    expect.hasAssertions();

    const returnFn = vi.fn<() => Promise<IteratorResult<unknown>>>();

    await expect(withAsyncIterator(createIterator(returnFn), () => Promise.reject(new Error("fail")))).rejects.toThrow(
      "fail",
    );
    expect(returnFn).toHaveBeenCalledTimes(1);
  });
});
