import { formatTruncationCount } from "#shared/services/dataset/formatTruncationCount";
import { describe, expect, test } from "vitest";

describe(formatTruncationCount, () => {
  const count = 1;

  test("renders an exact count bare", () => {
    expect.hasAssertions();

    expect(formatTruncationCount(count, false)).toBe("1");
  });

  test("renders a capped count with the plus", () => {
    expect.hasAssertions();

    expect(formatTruncationCount(count, true)).toBe("1+");
  });
});
