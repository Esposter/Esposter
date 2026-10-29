import { isOodlePatchPending } from "#src/services/recreation/animeStudio/isOodlePatchPending";
import { describe, expect, test } from "vitest";

describe(isOodlePatchPending, () => {
  test("skips a tree that already carries the patch", () => {
    expect.hasAssertions();

    expect(isOodlePatchPending({ appliesForward: false, appliesReverse: true })).toBe(false);
  });

  test("applies the patch to a tree at the pinned commit", () => {
    expect.hasAssertions();

    expect(isOodlePatchPending({ appliesForward: true, appliesReverse: false })).toBe(true);
  });

  test("fails a tree that is neither the pinned commit nor the patched one", () => {
    expect.hasAssertions();

    expect(() =>
      isOodlePatchPending({ appliesForward: false, appliesReverse: false }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: OodleHelper.cs, is neither the pinned commit nor the patched one]`,
    );
  });
});
