import { getStatedCounts } from "#src/services/coderabbit/feedback/getStatedCounts";
import { describe, expect, test } from "vitest";

describe(getStatedCounts, () => {
  // The bucket set is not fixed — a long review moves its minor findings out of the inline threads — so every
  // `<Name> comments (N)` heading is a bucket, whatever the name
  test("reads the actionable count and every body bucket, whatever its name", () => {
    expect.hasAssertions();

    expect(
      getStatedCounts(
        "**Actionable comments posted: 3**\n🧹 Nitpick comments (2)\n⚠️ Outside diff range comments (1)\n🟡 Minor comments (1)",
      ),
    ).toStrictEqual({ actionable: 3, bodyBuckets: { minor: 1, nitpick: 2, "outside diff range": 1 } });
  });

  test("reads no bucket from a walkthrough heading that counts files", () => {
    expect.hasAssertions();

    expect(getStatedCounts("📒 Files selected for processing (1)")).toStrictEqual({ actionable: 0, bodyBuckets: {} });
  });

  test("keeps the first count stated for a bucket", () => {
    expect.hasAssertions();

    expect(getStatedCounts("Minor comments (1)\nMinor comments (0)").bodyBuckets).toStrictEqual({ minor: 1 });
  });
});
