import { InvalidOperationError } from "#src/models/error/InvalidOperationError";
import { Operation } from "#src/models/shared/Operation";
import { createSemaphore } from "#src/util/promise/createSemaphore";
import { describe, expect, test } from "vitest";

describe(createSemaphore, () => {
  test("runs no more tasks at once than it has slots", async () => {
    expect.hasAssertions();

    const run = createSemaphore(2);
    let inFlightCount = 0;
    let peakCount = 0;
    const task = async (value: number): Promise<number> => {
      inFlightCount += 1;
      peakCount = Math.max(peakCount, inFlightCount);
      await Promise.resolve();
      inFlightCount -= 1;
      return value;
    };

    await expect(Promise.all([1, 2, 3, 4, 5].map((value) => run(() => task(value))))).resolves.toStrictEqual([
      1, 2, 3, 4, 5,
    ]);
    expect(peakCount).toBe(2);
  });

  test("starts the queued tasks in the order they were called", async () => {
    expect.hasAssertions();

    const run = createSemaphore(1);
    const startedLabels: string[] = [];
    const calls = ["a", "b", "c"].map((label) =>
      run(async () => {
        startedLabels.push(label);
        await Promise.resolve();
      }),
    );
    await Promise.all(calls);

    expect(startedLabels).toStrictEqual(["a", "b", "c"]);
  });

  // The queued task behind a rejection is the one that waits on its slot, so a slot not handed back would hang it
  test("hands the slot to the queued task when a task rejects", async () => {
    expect.hasAssertions();

    const run = createSemaphore(1);
    const failing = run(() => Promise.reject(new Error("offline")));
    const next = run(() => Promise.resolve("value"));

    await expect(failing).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: offline]`);
    await expect(next).resolves.toBe("value");
  });

  // A task that throws before it returns a promise must still hand its slot back, which a `.then` chain would not do
  test("hands the slot to the queued task when a task throws before it returns a promise", async () => {
    expect.hasAssertions();

    const run = createSemaphore(1);
    const failing = run((): Promise<string> => {
      throw new Error("sync");
    });
    const next = run(() => Promise.resolve("value"));

    await expect(failing).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: sync]`);
    await expect(next).resolves.toBe("value");
  });

  test.each([0, -1, 0.1, Number.NaN])(
    "throws for the slot count %s, which is not a whole number of at least one",
    (slots) => {
      expect.hasAssertions();

      expect(() => createSemaphore(slots)).toThrowErrorMatchingInlineSnapshot(
        `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, createSemaphore.name, "the slot count is not a whole number of at least one").message}]`,
      );
    },
  );
});
