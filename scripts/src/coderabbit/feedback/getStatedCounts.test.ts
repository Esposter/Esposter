import { getStatedCounts } from "#src/coderabbit/feedback/getStatedCounts";
import { describe, expect, test } from "vitest";

describe(getStatedCounts, () => {
  test("reads all three counts a review states about itself", () => {
    expect.hasAssertions();

    expect(
      getStatedCounts("**Actionable comments posted: 3**\n🧹 Nitpick comments (2)\n⚠️ Outside diff range comments (1)"),
    ).toStrictEqual({ actionable: 3, nitpick: 2, outsideDiff: 1 });
  });

  // An absent bucket means the review carried none of that kind, which reconciles as zero rather than as a
  // Number nothing can be compared against
  test("reports zero for a bucket the review has no heading for", () => {
    expect.hasAssertions();

    expect(getStatedCounts("**Actionable comments posted: 0**")).toStrictEqual({
      actionable: 0,
      nitpick: 0,
      outsideDiff: 0,
    });
  });
});
