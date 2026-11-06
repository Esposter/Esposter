// @vitest-environment happy-dom
import type { PaletteGroup } from "@/models/ui/palette/PaletteGroup";

import UiPalette from "@/components/Ui/Palette/Index.vue";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiPalette", () => {
  const groups: PaletteGroup[] = [
    {
      items: [
        { icon: UiIconMeaning.Copy, kind: "text", title: "Text" },
        { icon: UiIconMeaning.Tag, kind: "image", title: "Image" },
      ],
      title: "Content",
    },
    { items: [{ icon: UiIconMeaning.Copy, kind: "column", title: "Column" }], title: "Layout" },
  ];

  test("a query hides the groups and tiles it does not match", async () => {
    expect.hasAssertions();
    const component = mount(UiPalette, { props: { groups } });

    await component.get("input").setValue("image");

    expect(
      component.findAll("section").map((section) => section.findAll("button").map((button) => button.text())),
    ).toStrictEqual([["Content", "Image"]]);
  });

  test("a tile click emits the kind it carries", async () => {
    expect.hasAssertions();
    const component = mount(UiPalette, { props: { groups } });

    await component
      .findAll("button")
      .find((button) => button.text() === "Image")
      ?.trigger("click");

    expect(component.emitted("insert")).toStrictEqual([["image"]]);
  });
});
