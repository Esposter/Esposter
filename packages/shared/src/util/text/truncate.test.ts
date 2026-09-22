import { truncate } from "#src/util/text/truncate";
import { describe, expect, test } from "vitest";

describe(truncate, () => {
  test("returns string unchanged when within length", () => {
    expect.hasAssertions();

    expect(truncate("", 0)).toBe("");
    expect(truncate("a", 1)).toBe("a");
    expect(truncate("a", 2)).toBe("a");
  });

  test("truncates and appends suffix when over length", () => {
    expect.hasAssertions();

    expect(truncate("aaaaa", 4)).toBe("a...");
  });

  test("slices without suffix when length is shorter than suffix", () => {
    expect.hasAssertions();

    expect(truncate(" ", 0)).toBe("");
    expect(truncate("aaa", 2)).toBe("aa");
  });
});
