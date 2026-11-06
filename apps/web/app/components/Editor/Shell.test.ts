// @vitest-environment happy-dom
import EditorShell from "@/components/Editor/Shell.vue";
import type { EditorRegistry } from "@/models/editor/EditorRegistry";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { RESIZE_HANDLE_KEYBOARD_STEP } from "@/services/ui/constants";
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Context, Layout } from "vue-editor-layout-headless";
import { RegionEdge, RegionOpening, RegionPresentation, SizeClass } from "vue-editor-layout-headless";

// The size class is read from the display composable, so a test says how small the window is before the shell mounts
const display = vi.hoisted(() => ({ isCompact: false, isMobile: false }));
vi.mock(import("@/composables/ui/useUiDisplay"), () => ({
  useUiDisplay: () => ({ isMobile: shallowRef(display.isMobile), xs: shallowRef(display.isCompact) }),
}));

describe("editorShell", () => {
  const contentKey = "properties";
  const context: Context = { mode: "", selectionCount: 0, selectionKind: "", tool: "" };
  const defaultSize = RESIZE_HANDLE_KEYBOARD_STEP;
  const maximumSize = RESIZE_HANDLE_KEYBOARD_STEP * 3;
  const regionId = "properties";
  const regionName = " ";
  const layout: Layout = {
    canvasId: "canvas",
    panels: [{ condition: {}, id: regionId, regionId, selectionKindContentKeyMap: {}, wildcardContentKey: contentKey }],
    regions: [
      {
        defaultSize,
        edge: RegionEdge.End,
        id: regionId,
        maximumSize,
        minimumSize: 0,
        opening: RegionOpening.WithContent,
        sizeClassEdgeMap: {},
        sizeClassPresentationMap: {
          [SizeClass.Compact]: RegionPresentation.Sheet,
          [SizeClass.Expanded]: RegionPresentation.Docked,
          [SizeClass.Medium]: RegionPresentation.Sheet,
        },
      },
    ],
  };
  const registry: EditorRegistry = { [contentKey]: () => h("p") };
  const mountShell = () =>
    mount(EditorShell, {
      props: { context, layout, registry, regionNameMap: { [regionId]: regionName } },
      slots: { default: "<span></span>" },
    });

  beforeEach(() => {
    display.isCompact = false;
    display.isMobile = false;
  });

  test("a region is drawn as the layout presents it", () => {
    expect.hasAssertions();

    const expandedComponent = mountShell();

    expect(expandedComponent.get("aside").attributes("aria-label")).toBe(regionName);
    expect(expandedComponent.find("dialog").exists()).toBe(false);

    display.isCompact = true;
    display.isMobile = true;
    const compactComponent = mountShell();

    expect(compactComponent.find("aside").exists()).toBe(false);
    expect(compactComponent.get("dialog").element.open).toBe(false);
    expect(compactComponent.get("dialog").attributes("data-placement")).toBe(UiDialogPlacement.DrawerEnd);
  });

  test("a handle resizes from the keyboard", async () => {
    expect.hasAssertions();

    const component = mountShell();
    await component.get('[role="separator"]').trigger("keydown", { key: "ArrowLeft" });

    expect(component.get("aside").element.style.width).toBe(`${defaultSize + RESIZE_HANDLE_KEYBOARD_STEP}px`);
  });

  test("a resize past a limit stops at the limit", async () => {
    expect.hasAssertions();

    const component = mountShell();
    const separator = component.get('[role="separator"]');
    // Two steps reach the maximum, and the third asks for more than it allows
    await separator.trigger("keydown", { key: "ArrowLeft" });
    await separator.trigger("keydown", { key: "ArrowLeft" });
    await separator.trigger("keydown", { key: "ArrowLeft" });

    expect(component.get("aside").element.style.width).toBe(`${maximumSize}px`);
  });
});
