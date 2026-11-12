import { getArrowOperations } from "@/services/whiteboard/gesture/getArrowOperations";
import { applyPatches } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import {
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

    const arrowId = crypto.randomUUID();
    const operations = getArrowOperations(
      { elements: [] },
      arrowId,
      { hasArrowhead: false, point: { x: 0, y: 0 } },
      { hasArrowhead: true, point: { x: 100, y: 0 } },
    );
    const { document } = applyPatches({ elements: [] }, operations);

    expect(document).toStrictEqual({
      elements: [
        {
          color: "",
          dashPattern: DashPattern.Solid,
          end: { hasArrowhead: true, point: { x: 100, y: 0 } },
          id: arrowId,
          label: "",
          pathKind: ArrowPathKind.Straight,
          sketchLevel: SketchLevel.Artist,
          start: { hasArrowhead: false, point: { x: 0, y: 0 } },
          strokeWidth: StrokeWidth.Medium,
          textSize: TextSize.Small,
          type: PositionedElementType.Arrow,
        },
      ],
    });
  });
});
