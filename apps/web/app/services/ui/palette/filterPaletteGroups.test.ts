import type { PaletteGroup } from "@/models/ui/palette/PaletteGroup";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { filterPaletteGroups } from "@/services/ui/palette/filterPaletteGroups";
import { describe, expect, test } from "vitest";

describe(filterPaletteGroups, () => {
  const groups: PaletteGroup[] = [
    {
      items: [
        { icon: UiIconMeaning.Edit, kind: "text", title: "Text" },
        { icon: UiIconMeaning.Comment, kind: "comment", title: "Comment" },
      ],
      title: "Text input",
    },
    { items: [{ icon: UiIconMeaning.Image, kind: "image", title: "Image" }], title: "Content" },
  ];

  test("an empty query keeps every group", () => {
    expect.hasAssertions();

    expect(filterPaletteGroups(groups, "  ")).toStrictEqual(groups);
  });

  test("a title that one kind has leaves only that kind's group, holding only that kind", () => {
    expect.hasAssertions();

    expect(filterPaletteGroups(groups, "image")).toStrictEqual([
      { items: [{ icon: UiIconMeaning.Image, kind: "image", title: "Image" }], title: "Content" },
    ]);
  });

  test("a group's own title keeps all its kinds", () => {
    expect.hasAssertions();

    expect(filterPaletteGroups(groups, "text input")).toStrictEqual([groups[0]]);
  });

  test("a query nothing matches leaves no group", () => {
    expect.hasAssertions();

    expect(filterPaletteGroups(groups, "zzz")).toStrictEqual([]);
  });
});
