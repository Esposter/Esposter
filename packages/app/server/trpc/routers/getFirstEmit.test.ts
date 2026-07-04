import { withAsyncIterator } from "@@/server/trpc/routers/withAsyncIterator.test";
import { assert, describe, expect, test } from "vitest";

// The canonical "subscription emits" helper: subscribe, fire the trigger, and resolve the first emitted value.
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

describe(getFirstEmit, () => {
  test("resolves the first emitted value alongside the trigger", async () => {
    expect.hasAssertions();

    async function* createIterator() {
      yield "";
    }

    await expect(
      getFirstEmit(
        () => createIterator(),
        () => Promise.resolve(),
      ),
    ).resolves.toBe("");
  });
});
