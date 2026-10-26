import { withoutMapEntry } from "#src/services/shared/withoutMapEntry";
import { describe, expect, test } from "vitest";

describe(withoutMapEntry, () => {
  const MAP = new Map([
    ["first", 1],
    ["second", 2],
  ]);

  test("drops the key from a copy, leaving the map it was given as it was", () => {
    expect.hasAssertions();

    expect([...withoutMapEntry(MAP, "first")]).toStrictEqual([["second", 2]]);
    expect(MAP.size).toBe(2);
  });

  test("returns the same map when the key is not in it", () => {
    expect.hasAssertions();

    expect(withoutMapEntry(MAP, "third")).toBe(MAP);
  });
});
