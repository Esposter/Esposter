import { checkIsStackingAllowed } from "#src/services/coderabbit/collect/checkIsStackingAllowed";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { describe, expect, test } from "vitest";

const getYaml = (baseBranches: string): string => `reviews:\n  auto_review:\n    base_branches: ${baseBranches}\n`;

describe(checkIsStackingAllowed, () => {
  test.each([
    ['["^review/"]', true],
    ['[".*"]', true],
    ['["develop"]', false],
    ["[]", false],
  ])("decides base_branches %s as %s", (baseBranches, expected) => {
    expect.hasAssertions();

    expect(checkIsStackingAllowed(getYaml(baseBranches), getWindowBranch(1))).toBe(expected);
  });

  test("holds for a base the list does not reach, though it lists other window branches", () => {
    expect.hasAssertions();

    expect(checkIsStackingAllowed(getYaml('["^review/1$"]'), getWindowBranch(2))).toBe(false);
  });

  test("holds nothing when the file carries no base_branches key", () => {
    expect.hasAssertions();

    expect(
      checkIsStackingAllowed("reviews:\n  auto_review:\n    auto_incremental_review: false\n", getWindowBranch(1)),
    ).toBe(false);
  });
});
