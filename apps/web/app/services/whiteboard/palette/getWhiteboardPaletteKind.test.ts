import { WHITEBOARD_PALETTE_GROUPS } from "@/services/whiteboard/palette/constants";
import { getWhiteboardPaletteKind } from "@/services/whiteboard/palette/getWhiteboardPaletteKind";
import { PositionedElementType, ShapeKind } from "headless-block-editor";
import { describe, expect, test } from "vitest";

describe(getWhiteboardPaletteKind, () => {
  test("a shape is known by its kind, and a sticky note or a text box by its type", () => {
    expect.hasAssertions();

    expect(
      getWhiteboardPaletteKind({ kind: ShapeKind.Process, title: "Process", type: PositionedElementType.Shape }),
    ).toBe(ShapeKind.Process);
    expect(getWhiteboardPaletteKind({ title: "Sticky note", type: PositionedElementType.StickyNote })).toBe(
      PositionedElementType.StickyNote,
    );
    expect(getWhiteboardPaletteKind({ title: "Text box", type: PositionedElementType.Text })).toBe(
      PositionedElementType.Text,
    );
  });

  test("no two palette items share a kind, so a kind names one item", () => {
    expect.hasAssertions();

    const kinds = WHITEBOARD_PALETTE_GROUPS.flatMap(({ items }) => items).map((item) => getWhiteboardPaletteKind(item));

    expect(new Set(kinds).size).toBe(kinds.length);
  });
});
