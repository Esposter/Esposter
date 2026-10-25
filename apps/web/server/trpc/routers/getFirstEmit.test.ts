import { withAsyncIterator } from "#server/trpc/routers/withAsyncIterator.test";
import { assert, describe, expect, test, vi } from "vitest";

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
    next: () => Promise.resolve<IteratorResult<string>>({ done: false, value: "emitted" }),
  }),
});

describe(getFirstEmit, () => {
  test("resolves the first emitted value and runs the trigger", async () => {
    expect.hasAssertions();

    const trigger = vi.fn(() => Promise.resolve());
    const firstEmit = await getFirstEmit(createIterator, trigger);

    expect(firstEmit).toBe("emitted");
    expect(trigger).toHaveBeenCalledExactlyOnceWith();
  });
});
