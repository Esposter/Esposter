import { getMarkedBlock } from "#src/coderabbit/feedback/getMarkedBlock";
import { describe, expect, test } from "vitest";

describe(getMarkedBlock, () => {
  const body = "intro\n<!-- final_review_risk_start -->\n**Merge Risk:** high\n<!-- final_review_risk_end -->\ntail";

  test("returns the block between a marker pair", () => {
    expect.hasAssertions();

    expect(getMarkedBlock(body, "final_review_risk")).toBe("<!-- final_review_risk_start -->\n**Merge Risk:** high\n");
  });

  test("returns undefined for a marker the body does not carry", () => {
    expect.hasAssertions();

    expect(getMarkedBlock(body, "pre_merge_checks_walkthrough")).toBeUndefined();
  });
});
