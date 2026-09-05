import { withAsyncIterator } from "@@/server/trpc/routers/withAsyncIterator.test";
import { assert, describe, expect, test } from "vitest";

export const getFirstEmit = async <T>(
  createIterator: () => AsyncIterable<T>,
  trigger: () => Promise<unknown>,
): Promise<T> => {
  const result = await withAsyncIterator(createIterator, async (iterator) => {
    const [firstEmit] = await Promise.all([iterator.next(), trigger()]);
    return firstEmit;
  });
  assert(!result.done);
  return result.value;
};

const createIterator = (): AsyncIterable<string> => ({
  [Symbol.asyncIterator]: () => ({
    next: () => Promise.resolve<IteratorResult<string>>({ done: false, value: "" }),
  }),
});

describe(getFirstEmit, () => {
  test("resolves the first emitted value alongside the trigger", async () => {
    expect.hasAssertions();

    const firstEmit = await getFirstEmit(createIterator, () => Promise.resolve());

    expect(firstEmit).toBe("");
  });
});
