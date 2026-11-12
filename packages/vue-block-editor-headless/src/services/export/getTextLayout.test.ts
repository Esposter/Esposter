import type { TextPlacement } from "#src/models/export/TextPlacement";

import { TextAnchor } from "#src/models/export/TextAnchor";
import { TextSize } from "#src/models/TextSize";
import { VerticalAlignment } from "#src/models/VerticalAlignment";
import { getTextLayout } from "#src/services/export/getTextLayout";
import { getTextLineHeight } from "#src/services/export/getTextLineHeight";
import { getTextWidth } from "#src/services/export/getTextWidth";
import { describe, expect, test } from "vitest";

describe(getTextLayout, () => {
  // Ten narrow characters at the smallest size, so a placement this wide wraps only at a word or a newline
  const WIDTH = getTextWidth("a".repeat(10), TextSize.Small);

  test("a centred block's first baseline rises half a line for each line after the first", () => {
    expect.hasAssertions();

    const placement: TextPlacement = {
      isWrapped: true,
      point: { x: 50, y: 100 },
      textAnchor: TextAnchor.Middle,
      textSize: TextSize.Small,
      verticalAlignment: VerticalAlignment.Middle,
      width: WIDTH,
    };

    expect(getTextLayout("a\nb", placement)).toStrictEqual({
      baselineY: 100 - getTextLineHeight(TextSize.Small) / 2 + TextSize.Small / 3,
      lines: [
        { dy: 0, text: "a" },
        { dy: getTextLineHeight(TextSize.Small), text: "b" },
      ],
    });
  });

  test("a top-aligned text's baseline sits a font size below its point", () => {
    expect.hasAssertions();

    const placement: TextPlacement = {
      isWrapped: true,
      point: { x: 200, y: 0 },
      textAnchor: TextAnchor.Start,
      textSize: TextSize.Small,
      verticalAlignment: VerticalAlignment.Top,
      width: WIDTH,
    };

    expect(getTextLayout("a", placement)).toStrictEqual({ baselineY: TextSize.Small, lines: [{ dy: 0, text: "a" }] });
  });

  test("a larger text's lines step down by its own line height", () => {
    expect.hasAssertions();

    const placement: TextPlacement = {
      isWrapped: true,
      point: { x: 0, y: 0 },
      textAnchor: TextAnchor.Start,
      textSize: TextSize.Large,
      verticalAlignment: VerticalAlignment.Top,
      width: getTextWidth("a".repeat(10), TextSize.Large),
    };

    expect(getTextLayout("a\nb", placement).lines).toStrictEqual([
      { dy: 0, text: "a" },
      { dy: getTextLineHeight(TextSize.Large), text: "b" },
    ]);
  });
});
