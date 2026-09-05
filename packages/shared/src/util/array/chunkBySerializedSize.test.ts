import { chunkBySerializedSize } from "#src/util/array/chunkBySerializedSize";
import { describe, expect, test } from "vitest";

describe(chunkBySerializedSize, () => {
  const maxCount = 100;
  const maxBytes = 100;

  test("keeps every item, in order, across the chunks it produces", () => {
    expect.hasAssertions();

    const items = ["a", "b", "c", "d"];

    expect(chunkBySerializedSize(items, 8, maxCount).flat()).toStrictEqual(items);
  });

  test("splits on the byte budget", () => {
    expect.hasAssertions();

    // `"a"` plus its separating comma is 4 bytes, and the enclosing brackets cost one more than the comma
    // Charged to the first item, so a 9-byte budget takes two per chunk
    expect(chunkBySerializedSize(["a", "b", "c", "d"], 9, maxCount)).toStrictEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  test("counts the enclosing brackets against the byte budget", () => {
    expect.hasAssertions();

    const chunks = chunkBySerializedSize(["a", "b"], 8, maxCount);

    expect(chunks).toStrictEqual([["a"], ["b"]]);

    for (const chunk of chunks) expect(new TextEncoder().encode(JSON.stringify(chunk)).length).toBeLessThanOrEqual(8);
  });

  test("splits on the count bound before the byte budget is reached", () => {
    expect.hasAssertions();

    expect(chunkBySerializedSize(["a", "b", "c"], maxBytes, 2)).toStrictEqual([["a", "b"], ["c"]]);
  });

  test("measures serialized bytes, not characters", () => {
    expect.hasAssertions();

    expect(chunkBySerializedSize(["🙂", "🙂"], 9, maxCount)).toStrictEqual([["🙂"], ["🙂"]]);
  });

  test("gives an item that exceeds the budget on its own its own chunk", () => {
    expect.hasAssertions();

    expect(chunkBySerializedSize(["a", "bbbbbbbbbb", "c"], 5, maxCount)).toStrictEqual([["a"], ["bbbbbbbbbb"], ["c"]]);
  });

  test("returns no chunks for no items", () => {
    expect.hasAssertions();

    expect(chunkBySerializedSize([], maxBytes, maxCount)).toStrictEqual([]);
  });
});
