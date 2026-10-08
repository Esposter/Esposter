import { readBaseBranches } from "#src/services/coderabbit/collect/readBaseBranches";
import { describe, expect, test } from "vitest";

const BASE_BRANCH_PATTERN = "^review/";

describe(readBaseBranches, () => {
  test("reads a flow list on the key's own line", () => {
    expect.hasAssertions();

    const yaml = `reviews:\n  auto_review:\n    base_branches: ["${BASE_BRANCH_PATTERN}"]\n`;

    expect(readBaseBranches(yaml)).toStrictEqual([BASE_BRANCH_PATTERN]);
  });

  test("reads a block list beneath the key, ignoring comments and blank lines", () => {
    expect.hasAssertions();

    const yaml = `reviews:\n  auto_review:\n    # why\n\n    base_branches:\n      - "${BASE_BRANCH_PATTERN}" # stacked\n      - develop\n    auto_incremental_review: false\n`;

    expect(readBaseBranches(yaml)).toStrictEqual([BASE_BRANCH_PATTERN, "develop"]);
  });

  test("reads a block list at its key's own indent", () => {
    expect.hasAssertions();

    const yaml = `reviews:\n  auto_review:\n    base_branches:\n    - ${BASE_BRANCH_PATTERN}\n`;

    expect(readBaseBranches(yaml)).toStrictEqual([BASE_BRANCH_PATTERN]);
  });

  test("lists nothing when the key is absent", () => {
    expect.hasAssertions();

    const yaml = `reviews:\n  auto_review:\n    auto_incremental_review: false\n`;

    expect(readBaseBranches(yaml)).toStrictEqual([]);
  });

  test("does not read a base_branches key outside auto_review", () => {
    expect.hasAssertions();

    const yaml = `reviews:\n  base_branches: ["${BASE_BRANCH_PATTERN}"]\n  auto_review:\n    auto_incremental_review: false\n`;

    expect(readBaseBranches(yaml)).toStrictEqual([]);
  });
});
