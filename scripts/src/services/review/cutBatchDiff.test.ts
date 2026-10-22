import { REVIEW_DIFF_CHARACTER_LIMIT } from "#src/services/review/constants";
import { cutBatchDiff } from "#src/services/review/cutBatchDiff";
import { describe, expect, test } from "vitest";

describe(cutBatchDiff, () => {
  test("keeps a diff within both limits whole", () => {
    expect.hasAssertions();

    expect(cutBatchDiff(["+a", "-b"])).toStrictEqual({ diff: "+a\n-b", isDiffCut: false });
  });

  test("cuts one line that is past the character limit, as a generated file's diff is", () => {
    expect.hasAssertions();

    const { diff, isDiffCut } = cutBatchDiff(["+".repeat(REVIEW_DIFF_CHARACTER_LIMIT * 25)]);

    expect(diff).toHaveLength(REVIEW_DIFF_CHARACTER_LIMIT);
    expect(isDiffCut).toBe(true);
  });
});
