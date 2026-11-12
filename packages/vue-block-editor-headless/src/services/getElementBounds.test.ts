import type { TextElement } from "#src/models/TextElement";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { TextSize } from "#src/models/TextSize";
import { getTextLineHeight } from "#src/services/export/getTextLineHeight";
import { getTextWidth } from "#src/services/export/getTextWidth";
import { getElementBounds } from "#src/services/getElementBounds";
import { describe, expect, test } from "vitest";

describe(getElementBounds, () => {
  // Two narrow characters at the smallest size, so "a b c" wraps to three lines
  const TWO_CHARACTERS_WIDTH = getTextWidth("aa", TextSize.Small);
  const textBox = (isWrapped: boolean): TextElement => ({
    color: "",
    id: crypto.randomUUID(),
    isWrapped,
    text: "a b c",
    textSize: TextSize.Small,
    type: PositionedElementType.Text,
    width: TWO_CHARACTERS_WIDTH,
    x: 10,
    y: 20,
  });

  test("a text box is as high as the lines its text wraps to", () => {
    expect.hasAssertions();

    expect(getElementBounds(textBox(true))).toStrictEqual({
      height: getTextLineHeight(TextSize.Small) * 3,
      width: TWO_CHARACTERS_WIDTH,
      x: 10,
      y: 20,
    });
  });

  test("an unwrapped text box is as high as the lines its text breaks to, which is one", () => {
    expect.hasAssertions();

    expect(getElementBounds(textBox(false))).toStrictEqual({
      height: getTextLineHeight(TextSize.Small),
      width: TWO_CHARACTERS_WIDTH,
      x: 10,
      y: 20,
    });
  });
});
