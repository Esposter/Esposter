import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getWhiteboardPaletteGroups } from "@/services/whiteboard/palette/getWhiteboardPaletteGroups";
import { PositionedElementType } from "headless-block-editor";
import { describe, expect, test } from "vitest";

describe(getWhiteboardPaletteGroups, () => {
  test("the groups keep their titles in the order the palette lists them", () => {
    expect.hasAssertions();

    expect(getWhiteboardPaletteGroups().map(({ title }) => title)).toStrictEqual(["Shapes", "Notes"]);
  });

  test("each item is listed with its kind, its title and the icon of its kind", () => {
    expect.hasAssertions();

    expect(getWhiteboardPaletteGroups()[1]).toStrictEqual({
      items: [
        { icon: UiIconMeaning.Edit, kind: PositionedElementType.StickyNote, title: "Sticky note" },
        { icon: UiIconMeaning.ReadableText, kind: PositionedElementType.Text, title: "Text box" },
      ],
      title: "Notes",
    });
  });
});
