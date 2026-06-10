import { truncate } from "@/util/text/truncate";
import { describe, expect, test } from "vitest";

describe(truncate, () => {
  test("returns string unchanged when within length", () => {
    expect.hasAssertions();

    expect(truncate("", 0)).toBe("");
    expect(truncate("aaaaa", 5)).toBe("aaaaa");
    expect(truncate("aaaaa", 10)).toBe("aaaaa");
  });

  test("truncates and appends suffix when over length", () => {
    expect.hasAssertions();

    expect(truncate("aaaaaaaaaaa", 5)).toBe('a..."');
    expect(truncate("a".repeat(110), 100)).toHaveLength(100);
  });

  test("slices without suffix when length is shorter than suffix", () => {
    expect.hasAssertions();

    expect(truncate(" ", 0)).toBe("");
    expect(truncate("aaaaa", 2)).toBe("aa");
  });
});
