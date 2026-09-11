import { getLastReviewedSha } from "#src/coderabbit/window/getLastReviewedSha";
import { describe, expect, test } from "vitest";

describe(getLastReviewedSha, () => {
  const first = "a".repeat(40);
  const second = "b".repeat(40);
  const third = "c".repeat(40);

  test("returns the newest sha across every body it is given", () => {
    expect.hasAssertions();

    expect(getLastReviewedSha([`Review between ${first} and ${second}`, `Review between ${second} and ${third}`])).toBe(
      third,
    );
  });

  // The frontier is the last range of the last body — a filter run per page names whichever sha that page ended on
  test("returns the last range within a single body carrying several", () => {
    expect.hasAssertions();

    expect(getLastReviewedSha([`between ${first} and ${second}\nbetween ${second} and ${third}`])).toBe(third);
  });

  test("returns undefined when no body names a range", () => {
    expect.hasAssertions();

    expect(getLastReviewedSha(["Review rate limited"])).toBeUndefined();
  });
});
