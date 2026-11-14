import { forEachConcurrently } from "#src/services/shared/forEachConcurrently";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(forEachConcurrently, () => {
  const items = ["a", "b", "c", "d", "e"];
  const limit = 2;

  test("runs every item with no more than the limit in flight", async () => {
    expect.hasAssertions();
    const started: string[] = [];
    let inFlight = 0;
    let maxInFlight = 0;

    await forEachConcurrently(items, limit, async (item) => {
      started.push(item);
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await Promise.resolve();
      inFlight -= 1;
    });

    expect(started.toSorted()).toStrictEqual(items);
    expect(maxInFlight).toBeLessThanOrEqual(limit);
  });

  test("streams an async iterable without collecting it first", async () => {
    expect.hasAssertions();
    const started: string[] = [];

    await forEachConcurrently(
      // oxlint-disable-next-line typescript/require-await -- An AsyncIterable is what forEachConcurrently reads, and only an async generator yields one
      (async function* () {
        for (const item of items) yield item;
      })(),
      limit,
      async (item) => {
        started.push(item);
        await Promise.resolve();
      },
    );

    expect(started.toSorted()).toStrictEqual(items);
  });

  test("rejects with the first failure once the calls in flight have settled", async () => {
    expect.hasAssertions();
    const settled: string[] = [];

    const run = forEachConcurrently(items, limit, async (item) => {
      await Promise.resolve();
      if (item === "a") throw new InvalidOperationError(Operation.Create, item, "failed");
      settled.push(item);
    });

    await expect(run).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: a, failed]`,
    );
    expect(settled).toContain("b");
  });
});
