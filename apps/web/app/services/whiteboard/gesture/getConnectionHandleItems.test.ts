import type { ShapeElement } from "vue-block-editor-headless";

import { getConnectionHandleItems } from "@/services/whiteboard/gesture/getConnectionHandleItems";
import { describe, expect, test } from "vitest";
import {
  CornerStyle,
  DashPattern,
  PositionedElementType,
  ShapeKind,
  SketchLevel,
  StrokeWidth,
  TextSize,
} from "vue-block-editor-headless";

describe(getConnectionHandleItems, () => {
  const SHAPE_ID = crypto.randomUUID();
  const createShape = (kind: ShapeKind): ShapeElement => ({
    color: "",
    cornerStyle: CornerStyle.Sharp,
    dashPattern: DashPattern.Solid,
    fill: "",
    height: 50,
    id: SHAPE_ID,
    kind,
    sketchLevel: SketchLevel.Artist,
    strokeWidth: StrokeWidth.Medium,
    text: "",
    textSize: TextSize.Small,
    type: PositionedElementType.Shape,
    width: 100,
    x: 100,
    y: 100,
  });

  test("a single selected shape shows a connection handle at each of its four connection points", () => {
    expect.hasAssertions();

    const items = getConnectionHandleItems({ elements: [createShape(ShapeKind.Process)] }, [SHAPE_ID], 1);

    expect(items.map(({ connectionIndex }) => connectionIndex)).toStrictEqual([0, 1, 2, 3]);
  });

  test("an annotation shows no connection handle", () => {
    expect.hasAssertions();

    const items = getConnectionHandleItems({ elements: [createShape(ShapeKind.Annotation)] }, [SHAPE_ID], 1);

    expect(items).toStrictEqual([]);
  });
});
