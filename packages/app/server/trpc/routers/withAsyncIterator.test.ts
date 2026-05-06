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

describe(withAsyncIterator, () => {
  const makeIterator = (returnFn: () => Promise<void>) => () => ({
    [Symbol.asyncIterator]() {
      return { next: vi.fn(), return: returnFn };
    },
  });

  test("calls iterator.return() when fn resolves", async () => {
    expect.hasAssertions();
    const returnFn = vi.fn();
    await withAsyncIterator(makeIterator(returnFn), async () => "result");
    expect(returnFn).toHaveBeenCalledOnce();
  });

  test("calls iterator.return() when fn rejects", async () => {
    expect.hasAssertions();
    const returnFn = vi.fn();
    await expect(
      withAsyncIterator(makeIterator(returnFn), async () => {
        throw new Error("fail");
      }),
    ).rejects.toThrow("fail");
    expect(returnFn).toHaveBeenCalledOnce();
  });
});
