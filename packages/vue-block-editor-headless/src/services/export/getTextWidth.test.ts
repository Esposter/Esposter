import { TextSize } from "#src/models/TextSize";
import { TEXT_CHARACTER_WIDTH_SHARE } from "#src/services/export/constants";
import { getTextWidth } from "#src/services/export/getTextWidth";
import { describe, expect, test } from "vitest";

describe(getTextWidth, () => {
  test("a full-width character takes double the width of a narrow one", () => {
    expect.hasAssertions();

    expect(getTextWidth("a", TextSize.Small)).toBe(TextSize.Small * TEXT_CHARACTER_WIDTH_SHARE);
    expect(getTextWidth("文", TextSize.Small)).toBe(TextSize.Small * TEXT_CHARACTER_WIDTH_SHARE * 2);
  });

  test("a narrow character grows with the size of its text", () => {
    expect.hasAssertions();

    expect(getTextWidth("a", TextSize.ExtraLarge)).toBeGreaterThan(getTextWidth("a", TextSize.Small));
  });
});
