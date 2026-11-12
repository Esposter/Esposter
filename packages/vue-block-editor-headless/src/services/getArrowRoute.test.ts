import type { ArrowElement } from "#src/models/ArrowElement";

import { ArrowPathKind } from "#src/models/ArrowPathKind";
import { DashPattern } from "#src/models/DashPattern";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { StrokeWidth } from "#src/models/StrokeWidth";
import { ARROW_STUB_LENGTH } from "#src/services/constants";
import { getArrowRoute } from "#src/services/getArrowRoute";
import { POSITIONED_RECTANGLE_ID } from "#src/services/positionedConstants.test";
import { describe, expect, test } from "vitest";

describe(getArrowRoute, () => {
  const ARROW_ID = crypto.randomUUID();

  test("a right-angled arrow leaves a shape from its bottom point", () => {
    expect.hasAssertions();

    const arrow: ArrowElement = {
      color: "",
      dashPattern: DashPattern.Solid,
      end: { hasArrowhead: true, point: { x: 150, y: 250 } },
      id: ARROW_ID,
      label: "",
      pathKind: ArrowPathKind.RightAngled,
      start: {
        binding: { connectionPointIndex: 2, elementId: POSITIONED_RECTANGLE_ID },
        hasArrowhead: false,
        point: { x: 50, y: 100 },
      },
      strokeWidth: StrokeWidth.Medium,
      type: PositionedElementType.Arrow,
    };

    // Index 2 is the bottom point, so the route runs straight down out of the shape before it turns towards the free end
    expect(getArrowRoute(arrow)).toStrictEqual([
      { x: 50, y: 100 },
      { x: 50, y: 100 + ARROW_STUB_LENGTH },
      { x: 50, y: 250 },
      { x: 150, y: 250 },
    ]);
  });

  test("a curved arrow starts and ends at its two ends", () => {
    expect.hasAssertions();

    const arrow: ArrowElement = {
      color: "",
      dashPattern: DashPattern.Solid,
      end: { hasArrowhead: true, point: { x: 300, y: 0 } },
      id: ARROW_ID,
      label: "",
      pathKind: ArrowPathKind.Curved,
      start: { hasArrowhead: false, point: { x: 0, y: 0 } },
      strokeWidth: StrokeWidth.Medium,
      type: PositionedElementType.Arrow,
    };
    const route = getArrowRoute(arrow);

    expect([route.at(0), route.at(-1)]).toStrictEqual([
      { x: 0, y: 0 },
      { x: 300, y: 0 },
    ]);
  });
});
