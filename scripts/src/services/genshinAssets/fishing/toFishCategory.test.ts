import { toFishCategory } from "#src/services/genshinAssets/fishing/toFishCategory";
import { describe, expect, test } from "vitest";

describe(toFishCategory, () => {
  const MONSTER_ID = 1;
  const CATEGORY_TAG = 2;
  const OTHER_TAG = 3;
  const UNWEIGHTED_TAG = 4;

  test("a fish is filed under the tag its monster holds that a bait weights", () => {
    expect.hasAssertions();

    expect(
      toFishCategory(MONSTER_ID, new Set([CATEGORY_TAG, UNWEIGHTED_TAG]), new Set([CATEGORY_TAG, OTHER_TAG])),
    ).toBe(CATEGORY_TAG);
  });

  test("a fish no bait weights files in no category", () => {
    expect.hasAssertions();

    expect(toFishCategory(MONSTER_ID, new Set([UNWEIGHTED_TAG]), new Set([CATEGORY_TAG]))).toBeUndefined();
  });

  test("a fish holding two weighted tags is refused", () => {
    expect.hasAssertions();

    expect(() =>
      toFishCategory(MONSTER_ID, new Set([CATEGORY_TAG, OTHER_TAG]), new Set([CATEGORY_TAG, OTHER_TAG])),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 1, holds more than one fishing category]`,
    );
  });
});
