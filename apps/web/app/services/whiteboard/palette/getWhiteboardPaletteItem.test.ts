import { getWhiteboardPaletteItem } from "@/services/whiteboard/palette/getWhiteboardPaletteItem";
import { PositionedElementType, ShapeKind } from "headless-block-editor";
import { describe, expect, test } from "vitest";

describe(getWhiteboardPaletteItem, () => {
  test("a kind names the palette item it is made from", () => {
    expect.hasAssertions();

    expect(getWhiteboardPaletteItem(ShapeKind.Process)).toStrictEqual({
      kind: ShapeKind.Process,
      title: "Process",
      type: PositionedElementType.Shape,
    });
    expect(getWhiteboardPaletteItem(PositionedElementType.Text)).toStrictEqual({
      title: "Text box",
      type: PositionedElementType.Text,
    });
  });

  test("a kind the palette does not hold names no item", () => {
    expect.hasAssertions();

    expect(getWhiteboardPaletteItem("unknown")).toBeUndefined();
  });
});
