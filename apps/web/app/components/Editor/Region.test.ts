// @vitest-environment happy-dom
import type { EditorRegistry } from "@/models/editor/EditorRegistry";
import type { ResolvedRegion } from "vue-editor-layout-headless";

import EditorRegion from "@/components/Editor/Region.vue";
import { mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import { RegionEdge, RegionPresentation, SizeClass } from "vue-editor-layout-headless";

vi.mock(import("@/composables/editor/useEditorSizeClass"), () => ({
  useEditorSizeClass: () => computed(() => SizeClass.Expanded),
}));

const panelId = "panel";
const createRegion = (edge: RegionEdge): ResolvedRegion => ({
  activePanelId: panelId,
  edge,
  id: "region",
  isOpen: true,
  maximumSize: 0,
  minimumSize: 0,
  panels: [{ contentKey: panelId, id: panelId }],
  presentation: RegionPresentation.Docked,
  size: 0,
});
const registry: EditorRegistry = { [panelId]: defineComponent(() => () => h("p", "content")) };

describe("editorRegion", () => {
  // A region's body is full-bleed in every orientation, a bar and a column alike: each panel pads what it draws, so the
  // Body that holds the panel adds no padding of its own
  test("A full-bleed region opts out of the padding", () => {
    expect.hasAssertions();

    const bar = mount(EditorRegion, {
      props: { name: "Bar", panelNameMap: {}, region: createRegion(RegionEdge.Top), registry },
    });
    const column = mount(EditorRegion, {
      props: { name: "Column", panelNameMap: {}, region: createRegion(RegionEdge.Start), registry },
    });

    expect(bar.get(".ui-region-body").classes()).toStrictEqual(["ui-region-body"]);
    expect(column.get(".ui-region-body").classes()).toStrictEqual(["ui-region-body"]);
  });
});
