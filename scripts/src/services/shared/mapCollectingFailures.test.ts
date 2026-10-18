import { mapCollectingFailures } from "#src/services/shared/mapCollectingFailures";
import { describe, expect, test } from "vitest";

describe(mapCollectingFailures, () => {
  test("maps every item, and throws once naming each item that failed", () => {
    expect.hasAssertions();

    const mapped: number[] = [];
    const map = (item: number) => {
      mapped.push(item);
      if (item % 2 === 0) throw new Error(`${item} is even`);
      return item;
    };

    expect(() => mapCollectingFailures("quests", [1, 2, 3, 4], map)).toThrowErrorMatchingInlineSnapshot(`
      [InvalidOperationError: Invalid operation: Read, name: quests, fails on 2 of 4:
      2: 2 is even
      4: 4 is even]
    `);
    expect(mapped).toStrictEqual([1, 2, 3, 4]);
  });

  test("returns every result when no item fails", () => {
    expect.hasAssertions();

    expect(mapCollectingFailures("quests", [1, 3], (item) => item * 10)).toStrictEqual([10, 30]);
  });
});
