import { getArrowOperations } from "@/services/whiteboard/gesture/getArrowOperations";
import { applyPatches } from "@esposter/shared";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";
import {
  ArrowheadKind,
  ArrowPathKind,
  DashPattern,
  PositionedElementType,
  SketchLevel,
  StrokeWidth,
  TextSize,
} from "vue-block-editor-headless";

describe(getArrowOperations, () => {
  test("a new arrow draws at medium width", () => {
    expect.hasAssertions();

    const arrowId = v7();
    const operations = getArrowOperations(
      { elements: [] },
      arrowId,
      { point: { x: 0, y: 0 } },
      { arrowhead: ArrowheadKind.Triangle, point: { x: 100, y: 0 } },
    );
    const { document } = applyPatches({ elements: [] }, operations);

    expect(document).toStrictEqual({
      elements: [
        {
          color: "",
          dashPattern: DashPattern.Solid,
          end: { arrowhead: ArrowheadKind.Triangle, point: { x: 100, y: 0 } },
          id: arrowId,
          label: "",
          pathKind: ArrowPathKind.Straight,
          sketchLevel: SketchLevel.Artist,
          start: { point: { x: 0, y: 0 } },
          strokeWidth: StrokeWidth.Medium,
          textSize: TextSize.Small,
          type: PositionedElementType.Arrow,
        },
      ],
    });
  });
});
