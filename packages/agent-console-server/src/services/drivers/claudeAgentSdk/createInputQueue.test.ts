import { createInputQueue } from "#src/services/drivers/claudeAgentSdk/createInputQueue";
import { describe, expect, test } from "vitest";

describe(createInputQueue, () => {
  test("yields what was pushed before and after the reader waits, then ends on close", async () => {
    expect.hasAssertions();

    const { close, iterable, push } = createInputQueue<string>();
    const iterator = iterable[Symbol.asyncIterator]();
    push("");
    const first = await iterator.next();
    const pendingSecond = iterator.next();
    push(" ");
    const second = await pendingSecond;
    const pendingEnd = iterator.next();
    close();

    expect(first).toStrictEqual({ done: false, value: "" });
    expect(second).toStrictEqual({ done: false, value: " " });
    await expect(pendingEnd).resolves.toStrictEqual({ done: true, value: undefined });
  });
});
