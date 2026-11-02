import { TextAnchor } from "#src/models/export/TextAnchor";
import { TEXT_CHARACTER_WIDTH, TEXT_FONT_SIZE, TEXT_LINE_HEIGHT } from "#src/services/export/constants";
import { getTextLayout } from "#src/services/export/getTextLayout";
import { describe, expect, test } from "vitest";

describe(getTextLayout, () => {
  test("a centred block's first baseline rises half a line for each line after the first", () => {
    expect.hasAssertions();

    expect(
      getTextLayout("a\nb", {
        point: { x: 50, y: 100 },
        textAnchor: TextAnchor.Middle,
        width: TEXT_CHARACTER_WIDTH * 10,
      }),
    ).toStrictEqual({
      baselineY: 100 - TEXT_LINE_HEIGHT / 2 + TEXT_FONT_SIZE / 3,
      lines: [
        { dy: 0, text: "a" },
        { dy: TEXT_LINE_HEIGHT, text: "b" },
      ],
    });
  });

  test("a start-anchored text's baseline sits a font size below its point", () => {
    expect.hasAssertions();

    expect(
      getTextLayout("a", { point: { x: 200, y: 0 }, textAnchor: TextAnchor.Start, width: TEXT_CHARACTER_WIDTH * 10 }),
    ).toStrictEqual({ baselineY: TEXT_FONT_SIZE, lines: [{ dy: 0, text: "a" }] });
  });

  test("a long label wraps inside its shape", () => {
    expect.hasAssertions();

    // Three narrow characters wide, so "a b" fills the first line and "c d" the second
    expect(
      getTextLayout("a b c d", {
        point: { x: 50, y: 50 },
        textAnchor: TextAnchor.Middle,
        width: TEXT_CHARACTER_WIDTH * 3,
      }),
    ).toStrictEqual({
      baselineY: 50 - TEXT_LINE_HEIGHT / 2 + TEXT_FONT_SIZE / 3,
      lines: [
        { dy: 0, text: "a b" },
        { dy: TEXT_LINE_HEIGHT, text: "c d" },
      ],
    });
  });
});
