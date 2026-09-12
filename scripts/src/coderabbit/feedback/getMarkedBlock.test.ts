import { getMarkedBlock } from "#src/coderabbit/feedback/getMarkedBlock";
import { describe, expect, test } from "vitest";

describe(getMarkedBlock, () => {
  const block = "<!-- final_review_risk_start -->\n**Merge Risk:** high\n";
  const body = `intro\n${block}<!-- final_review_risk_end -->\ntail`;

  test("returns the block between a marker pair", () => {
    expect.hasAssertions();

    expect(getMarkedBlock(body, "final_review_risk")).toBe(block);
  });

  // An end marker left over ahead of the start would otherwise slice to an empty string that reads as a block
  test("searches for the end marker after the start", () => {
    expect.hasAssertions();

    expect(getMarkedBlock(`<!-- final_review_risk_end -->\n${body}`, "final_review_risk")).toBe(block);
  });

  test("returns undefined for a marker the body does not carry", () => {
    expect.hasAssertions();

    expect(getMarkedBlock(body, "pre_merge_checks_walkthrough")).toBeUndefined();
  });
});
