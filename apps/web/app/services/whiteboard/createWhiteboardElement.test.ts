import { createWhiteboardElement } from "@/services/whiteboard/createWhiteboardElement";
import { WHITEBOARD_STICKY_NOTE_FILL } from "@/services/whiteboard/palette/constants";
import { v7 } from "uuid";
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

describe(createWhiteboardElement, () => {
  const ELEMENT_ID = v7();
  const BOUNDS = { height: 80, width: 120, x: 10, y: 20 };

  test("a new shape starts with no fill", () => {
    expect.hasAssertions();

    const shape = createWhiteboardElement(
      { kind: ShapeKind.Process, type: PositionedElementType.Shape },
      ELEMENT_ID,
      BOUNDS,
    );

    expect(shape).toStrictEqual({
      color: "",
      cornerStyle: CornerStyle.Sharp,
      dashPattern: DashPattern.Solid,
      fill: "",
      height: 80,
      id: ELEMENT_ID,
      kind: ShapeKind.Process,
      sketchLevel: SketchLevel.Artist,
      strokeWidth: StrokeWidth.Medium,
      text: "",
      textSize: TextSize.Small,
      type: PositionedElementType.Shape,
      width: 120,
      x: 10,
      y: 20,
    });
  });

  test("a sticky note keeps the fill it starts with", () => {
    expect.hasAssertions();

    const stickyNote = createWhiteboardElement({ type: PositionedElementType.StickyNote }, ELEMENT_ID, BOUNDS);

    expect(stickyNote).toStrictEqual({
      color: "",
      dashPattern: DashPattern.Solid,
      fill: WHITEBOARD_STICKY_NOTE_FILL,
      height: 80,
      id: ELEMENT_ID,
      sketchLevel: SketchLevel.Artist,
      strokeWidth: StrokeWidth.Medium,
      text: "",
      textSize: TextSize.Small,
      type: PositionedElementType.StickyNote,
      width: 120,
      x: 10,
      y: 20,
    });
  });
});
