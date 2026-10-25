import { withAsyncIterator } from "#server/trpc/routers/withAsyncIterator.test";
import { assert, describe } from "vitest";

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

describe.todo("getFirstEmit");
