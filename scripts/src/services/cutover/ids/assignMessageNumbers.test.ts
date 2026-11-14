import { describe, expect, test } from "vitest";

import { assignMessageNumbers } from "#src/services/cutover/ids/assignMessageNumbers";

describe(assignMessageNumbers, () => {
  const earlier = new Date(1700000000000);
  const later = new Date(1700000001000);

  test("numbers messages in createdAt order, breaking a tie by row key", () => {
    expect.hasAssertions();

    const messages = [
      { createdAt: later, rowKey: "a" },
      { createdAt: earlier, rowKey: "c" },
      { createdAt: earlier, rowKey: "b" },
    ];

    expect(assignMessageNumbers(messages, new Map())).toStrictEqual([
      { number: 1, rowKey: "b" },
      { number: 2, rowKey: "c" },
      { number: 3, rowKey: "a" },
    ]);
  });

  test("keeps the numbers a room already has and numbers only what is new after its highest", () => {
    expect.hasAssertions();

    const numberByRowKey = new Map([["b", 1]]);
    const messages = [
      { createdAt: earlier, rowKey: "b" },
      { createdAt: later, rowKey: "d" },
    ];

    expect(assignMessageNumbers(messages, numberByRowKey)).toStrictEqual([{ number: 2, rowKey: "d" }]);
  });

  test("gives nothing new on a re-run, so an import that repeats writes the same numbers", () => {
    expect.hasAssertions();

    const numberByRowKey = new Map([
      ["b", 1],
      ["c", 2],
    ]);
    const messages = [
      { createdAt: earlier, rowKey: "b" },
      { createdAt: earlier, rowKey: "c" },
    ];

    expect(assignMessageNumbers(messages, numberByRowKey)).toStrictEqual([]);
  });
});
