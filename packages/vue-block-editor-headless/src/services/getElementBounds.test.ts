import type { TextElement } from "#src/models/TextElement";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { TEXT_CHARACTER_WIDTH, TEXT_LINE_HEIGHT } from "#src/services/export/constants";
import { getElementBounds } from "#src/services/getElementBounds";
import { describe, expect, test } from "vitest";

describe(getElementBounds, () => {
  test("a text box is as high as the lines its text wraps to", () => {
    expect.hasAssertions();

    // Two narrow characters wide, so "a b c" wraps to three lines
    const textBox: TextElement = {
      color: "",
      id: crypto.randomUUID(),
      text: "a b c",
      type: PositionedElementType.Text,
      width: TEXT_CHARACTER_WIDTH * 2,
      x: 10,
      y: 20,
    };

    expect(getElementBounds(textBox)).toStrictEqual({
      height: TEXT_LINE_HEIGHT * 3,
      width: TEXT_CHARACTER_WIDTH * 2,
      x: 10,
      y: 20,
    });
  });
});
