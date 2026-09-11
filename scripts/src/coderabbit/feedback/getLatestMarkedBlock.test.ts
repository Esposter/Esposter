import { getLatestMarkedBlock } from "#src/coderabbit/feedback/getLatestMarkedBlock";
import { describe, expect, test } from "vitest";

const createBody = (risk: string) =>
  `<!-- final_review_risk_start -->
**Merge Risk:** ${risk}
<!-- final_review_risk_end -->`;

describe(getLatestMarkedBlock, () => {
  // A status comment posted after the walkthrough takes the newest slot, and the verdict is still in the
  // Walkthrough — reading only the last body prints nothing while the block exists
  test("finds the block in an older body when the newest has none", () => {
    expect.hasAssertions();

    expect(getLatestMarkedBlock([createBody("high"), "Review rate limited"], "final_review_risk")).toBe(
      `<!-- final_review_risk_start -->\n**Merge Risk:** high\n`,
    );
  });

  test("prefers the newest body that carries the block", () => {
    expect.hasAssertions();

    expect(getLatestMarkedBlock([createBody("high"), createBody("low")], "final_review_risk")).toBe(
      `<!-- final_review_risk_start -->\n**Merge Risk:** low\n`,
    );
  });

  test("returns undefined when no body carries it", () => {
    expect.hasAssertions();

    expect(getLatestMarkedBlock(["Review rate limited"], "final_review_risk")).toBeUndefined();
  });
});
