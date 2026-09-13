import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";

import { checkIsSlotFree } from "#src/services/coderabbit/collect/checkIsSlotFree";
import { describe, expect, test } from "vitest";

const getCheckStatus = (bucket: string): CheckStatus => ({ bucket, description: "", name: "" });

describe(checkIsSlotFree, () => {
  test.each([
    ["pending", false],
    ["pass", true],
    ["fail", true],
  ])("reads %s as %s", (bucket, expected) => {
    expect.hasAssertions();

    expect(checkIsSlotFree(getCheckStatus(bucket))).toBe(expected);
  });

  // Fail closed: `gh` answering nothing reads exactly like a review that started a second ago
  test("holds the slot when the status could not be read", () => {
    expect.hasAssertions();

    expect(checkIsSlotFree(undefined)).toBe(false);
  });
});
