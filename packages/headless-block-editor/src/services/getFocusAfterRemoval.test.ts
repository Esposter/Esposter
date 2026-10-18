import { TEST_DOCUMENT } from "#src/services/constants.test";
import { getFocusAfterRemoval } from "#src/services/getFocusAfterRemoval";
import { describe, expect, test } from "vitest";

describe(getFocusAfterRemoval, () => {
  test("removing the last child", () => {
    expect.hasAssertions();

    expect(getFocusAfterRemoval(TEST_DOCUMENT, "/content/0/props/children/0")).toBe("/content/0");
  });
});
