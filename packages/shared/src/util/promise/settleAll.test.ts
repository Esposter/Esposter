import { settleAll } from "#src/util/promise/settleAll";
import { describe, expect, test } from "vitest";

describe(settleAll, () => {
  test("returns no values for no tasks", async () => {
    expect.hasAssertions();
    await expect(settleAll([])).resolves.toStrictEqual([]);
  });

  test("returns values in task order across waves", async () => {
    expect.hasAssertions();
    await expect(settleAll([() => Promise.resolve("a"), () => Promise.resolve("b")], 1)).resolves.toStrictEqual([
      "a",
      "b",
    ]);
  });

  test("waits for its in-flight tasks before rejecting", async () => {
    expect.hasAssertions();
    const { promise, resolve } = Promise.withResolvers<string>();
    const events: string[] = [];
    // eslint-disable-next-line no-restricted-syntax -- `settleAll` rejects, and this asserts that rejection directly: a Result wrapper would assert the wrapper rather than the primitive under test
    const settling = settleAll([
      async () => {
        await promise;
        events.push("settled");
      },
      () => Promise.reject(new Error("a")),
    ]).catch(() => {
      events.push("threw");
    });
    await new Promise((resolveTick) => {
      setTimeout(resolveTick, 0);
    });

    expect(events).toStrictEqual([]);
    resolve("");
    await settling;

    expect(events).toStrictEqual(["settled", "threw"]);
  });

  // A synchronous throw escapes `map` unless every task is called through a promise, taking the rejection
  // Straight to the caller while the tasks already started keep running
  test("waits for its in-flight tasks when one throws synchronously", async () => {
    expect.hasAssertions();
    const { promise, resolve } = Promise.withResolvers<string>();
    const events: string[] = [];
    // eslint-disable-next-line no-restricted-syntax -- `settleAll` rejects, and this asserts that rejection directly: a Result wrapper would assert the wrapper rather than the primitive under test
    const settling = settleAll([
      async () => {
        await promise;
        events.push("settled");
      },
      () => {
        throw new Error("a");
      },
    ]).catch(() => {
      events.push("threw");
    });
    await new Promise((resolveTick) => {
      setTimeout(resolveTick, 0);
    });

    expect(events).toStrictEqual([]);
    resolve("");
    await settling;

    expect(events).toStrictEqual(["settled", "threw"]);
  });

  test("rethrows a lone rejection as it was thrown", async () => {
    expect.hasAssertions();
    const error = new Error("a");

    await expect(settleAll([() => Promise.reject(error)])).rejects.toBe(error);
  });

  test("carries every rejection of a wave under the first one's message", async () => {
    expect.hasAssertions();
    // eslint-disable-next-line no-restricted-syntax -- `settleAll` rejects, and this asserts that rejection directly: a Result wrapper would assert the wrapper rather than the primitive under test
    const caughtError = await settleAll([
      () => Promise.reject(new Error("a")),
      () => Promise.reject(new Error("b")),
    ]).catch((error: unknown) => error);

    expect(caughtError).toMatchInlineSnapshot(`[AggregateError: a]`);
    expect(caughtError instanceof AggregateError ? caughtError.errors : []).toMatchInlineSnapshot(`
      [
        [Error: a],
        [Error: b],
      ]
    `);
  });

  test("does not start a wave after a rejecting one", async () => {
    expect.hasAssertions();

    let startedCount = 0;
    const task = (): Promise<void> => {
      startedCount += 1;
      return Promise.reject(new Error("a"));
    };

    await expect(settleAll([task, task], 1)).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: a]`);

    expect(startedCount).toBe(1);
  });
});
