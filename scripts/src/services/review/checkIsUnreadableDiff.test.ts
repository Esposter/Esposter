import { REVIEW_LINE_CHARACTER_LIMIT } from "#src/services/review/constants";
import { checkIsUnreadableDiff } from "#src/services/review/checkIsUnreadableDiff";
import { describe, expect, test } from "vitest";

describe(checkIsUnreadableDiff, () => {
  test("reads a diff of lines within the limit as readable", () => {
    expect.hasAssertions();

    expect(checkIsUnreadableDiff(`+const a = 1;\n-const b = 2;`)).toBe(false);
  });

  test("reads a diff with one line past the limit as unreadable", () => {
    expect.hasAssertions();

    expect(checkIsUnreadableDiff(`+const a = 1;\n+${"x".repeat(REVIEW_LINE_CHARACTER_LIMIT + 1)}`)).toBe(true);
  });
});
