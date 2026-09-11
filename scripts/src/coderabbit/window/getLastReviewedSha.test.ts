import { getLastReviewedSha } from "#src/coderabbit/window/getLastReviewedSha";
import { describe, expect, test } from "vitest";

describe(getLastReviewedSha, () => {
  const first = "a".repeat(40);
  const second = "b".repeat(40);
  const third = "c".repeat(40);

  // The frontier is the last range of the last body — a filter run per page names whichever sha its page ended on
  test("returns the last range of the last body", () => {
    expect.hasAssertions();

    expect(
      getLastReviewedSha([
        `between ${first} and ${first}`,
        `between ${first} and ${second}\nbetween ${second} and ${third}`,
      ]),
    ).toBe(third);
  });

  test("returns undefined when no body names a range", () => {
    expect.hasAssertions();

    expect(getLastReviewedSha(["Review rate limited"])).toBeUndefined();
  });
});
