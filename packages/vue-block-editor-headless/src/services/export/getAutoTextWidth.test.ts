import { TextSize } from "#src/models/TextSize";
import { getAutoTextWidth } from "#src/services/export/getAutoTextWidth";
import { getTextWidth } from "#src/services/export/getTextWidth";
import { describe, expect, test } from "vitest";

describe(getAutoTextWidth, () => {
  test("an unwrapped text is as wide as its widest line", () => {
    expect.hasAssertions();

    expect(getAutoTextWidth("ab\nabcd", TextSize.Small)).toBe(getTextWidth("abcd", TextSize.Small));
  });

  test("an empty text is one narrow character wide", () => {
    expect.hasAssertions();

    expect(getAutoTextWidth("", TextSize.Small)).toBe(getTextWidth("a", TextSize.Small));
  });
});
