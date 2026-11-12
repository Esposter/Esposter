import type { TextElement } from "#src/models/TextElement";

import { TextAnchor } from "#src/models/export/TextAnchor";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { ARROW_LABEL_WIDTH } from "#src/services/constants";
import { getTextPlacement } from "#src/services/export/getTextPlacement";
import { POSITIONED_ARROW, POSITIONED_RECTANGLE } from "#src/services/positionedConstants.test";
import { describe, expect, test } from "vitest";

describe(getTextPlacement, () => {
  test("an arrow's label sits at its midpoint", () => {
    expect.hasAssertions();

    // The straight arrow runs from (50, 100) to (150, 250), so its midpoint is (100, 175)
    expect(getTextPlacement(POSITIONED_ARROW)).toStrictEqual({
      point: { x: 100, y: 175 },
      textAnchor: TextAnchor.Middle,
      width: ARROW_LABEL_WIDTH,
    });
  });

  test("a shape's text is centred in its box", () => {
    expect.hasAssertions();

    expect(getTextPlacement(POSITIONED_RECTANGLE)).toStrictEqual({
      point: { x: 50, y: 50 },
      textAnchor: TextAnchor.Middle,
      width: 100,
    });
  });

  test("a text box's text hangs from its corner", () => {
    expect.hasAssertions();

    const text: TextElement = {
      color: "",
      id: crypto.randomUUID(),
      text: "",
      type: PositionedElementType.Text,
      width: 100,
      x: 200,
      y: 0,
    };

    expect(getTextPlacement(text)).toStrictEqual({ point: { x: 200, y: 0 }, textAnchor: TextAnchor.Start, width: 100 });
  });
});
