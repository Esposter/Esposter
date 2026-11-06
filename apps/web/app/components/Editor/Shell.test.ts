// @vitest-environment happy-dom
import type { EditorRegistry } from "@/models/editor/EditorRegistry";
import type { Context, Layout, Region } from "vue-editor-layout-headless";

import EditorShell from "@/components/Editor/Shell.vue";
import { EditorType } from "@/models/editor/EditorType";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { RESIZE_HANDLE_KEYBOARD_STEP } from "@/services/ui/constants";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";
import { RegionEdge, RegionOpening, RegionPresentation, SizeClass } from "vue-editor-layout-headless";

// The size class is read from the display composable, so a test says how small the window is before the shell mounts
const display = vi.hoisted(() => ({ isCompact: false, isMobile: false }));
vi.mock(import("@/composables/ui/useUiDisplay"), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    useUiDisplay: () => ({
      ...actual.useUiDisplay(),
      isMobile: shallowRef(display.isMobile),
      xs: shallowRef(display.isCompact),
    }),
  };
});

describe("editorShell", () => {
  const contentKey = "properties";
  const context: Context = { mode: "", selectionCount: 0, selectionKind: "", tool: "" };
  const selectionKind = "shape";
  const selectedContext: Context = { mode: "", selectionCount: 1, selectionKind, tool: "" };
  const defaultSize = RESIZE_HANDLE_KEYBOARD_STEP;
  const maximumSize = RESIZE_HANDLE_KEYBOARD_STEP * 3;
  const regionId = "properties";
  const regionName = " ";
  const toolRegionId = "tools";
  const region: Region = {
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
  };
  // A panel is shown while the reader has selected something of its kind, so a region with nothing selected is not drawn
  const createLayout = (layoutRegion: Region): Layout => ({
    canvasId: "canvas",
    panels: [
      {
        condition: { selectionKinds: [selectionKind] },
        id: layoutRegion.id,
        regionId: layoutRegion.id,
        selectionKindContentKeyMap: {},
        wildcardContentKey: contentKey,
      },
    ],
    regions: [layoutRegion],
  });
  const layout = createLayout(region);
  // A selection's panel floats over the canvas on an expanded window, so it never takes a column beside the canvas
  const overlayPresentationMap = {
    [SizeClass.Compact]: RegionPresentation.Sheet,
    [SizeClass.Expanded]: RegionPresentation.Overlay,
    [SizeClass.Medium]: RegionPresentation.Sheet,
  };
  const overlayLayout = createLayout({ ...region, sizeClassPresentationMap: overlayPresentationMap });
  // A tool region at the top of an expanded window, which a compact window moves to the bottom edge
  const toolLayout = createLayout({
    ...region,
    edge: RegionEdge.Top,
    id: toolRegionId,
    sizeClassEdgeMap: { [SizeClass.Compact]: RegionEdge.Bottom },
    sizeClassPresentationMap: {
      [SizeClass.Compact]: RegionPresentation.Docked,
      [SizeClass.Expanded]: RegionPresentation.Docked,
      [SizeClass.Medium]: RegionPresentation.Docked,
    },
  });
  // An overlay bar over the canvas's top edge, sized at the maximum so its height is told apart from the column's width
  const overlayBarRegion: Region = {
    ...region,
    defaultSize: maximumSize,
    edge: RegionEdge.Top,
    id: toolRegionId,
    sizeClassPresentationMap: overlayPresentationMap,
  };
  // The column is listed first, so it is the shell's first aside, the one drawn before the bar
  const overlayBarLayout: Layout = {
    ...overlayLayout,
    panels: [
      ...overlayLayout.panels,
      {
        condition: { selectionKinds: [selectionKind] },
        id: overlayBarRegion.id,
        regionId: overlayBarRegion.id,
        selectionKindContentKeyMap: {},
        wildcardContentKey: contentKey,
      },
    ],
    regions: [...overlayLayout.regions, overlayBarRegion],
  };
  const registry: EditorRegistry = { [contentKey]: () => h("p") };
  // The shell is attached to the document so focus can move to and from its controls
  const mountShell = ({
    context: shellContext = selectedContext,
    layout: shellLayout = layout,
    panelNameMap = {},
  }: { context?: Context; layout?: Layout; panelNameMap?: Record<string, string> } = {}) =>
    mount(EditorShell, {
      attachTo: document.body,
      props: {
        context: shellContext,
        editorType: EditorType.Whiteboard,
        layout: shellLayout,
        panelNameMap,
        regionNameMap: { [regionId]: regionName, [toolRegionId]: regionName },
        registry,
      },
      slots: { default: "<span data-canvas></span>" },
    });

  beforeEach(() => {
    display.isCompact = false;
    display.isMobile = false;
    localStorage.clear();
    setActivePinia(createPinia());
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
  });

  test("a compact window opens a sheet from the bottom", () => {
    expect.hasAssertions();

    display.isCompact = true;
    display.isMobile = true;
    const component = mountShell();

    expect(component.get("dialog").attributes("data-placement")).toBe(UiDialogPlacement.DrawerBottom);
  });

  test("a medium window opens a sheet from its own edge", () => {
    expect.hasAssertions();

    display.isMobile = true;
    const component = mountShell();

    expect(component.get("dialog").attributes("data-placement")).toBe(UiDialogPlacement.DrawerEnd);
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

  test("a region with equal limits draws no resize handle", () => {
    expect.hasAssertions();

    const fixedLayout = createLayout({ ...region, maximumSize: defaultSize, minimumSize: defaultSize });
    const component = mountShell({ layout: fixedLayout });

    expect(component.get("aside").element.style.width).toBe(`${defaultSize}px`);
    expect(component.find('[role="separator"]').exists()).toBe(false);
  });

  test("a stored size is restored on the next open", async () => {
    expect.hasAssertions();

    const component = mountShell();
    await component.get('[role="separator"]').trigger("keydown", { key: "ArrowLeft" });
    await flushPromises();
    component.unmount();

    setActivePinia(createPinia());
    const reopenedComponent = mountShell();

    expect(reopenedComponent.get("aside").element.style.width).toBe(`${defaultSize + RESIZE_HANDLE_KEYBOARD_STEP}px`);
  });

  test("a region with several panels draws a tab for each", async () => {
    expect.hasAssertions();

    const otherPanelId = "other";
    const tabbedLayout: Layout = {
      ...layout,
      panels: [
        ...layout.panels,
        {
          condition: { selectionKinds: [selectionKind] },
          id: otherPanelId,
          regionId,
          selectionKindContentKeyMap: {},
          wildcardContentKey: contentKey,
        },
      ],
    };
    const component = mountShell({ layout: tabbedLayout, panelNameMap: { [otherPanelId]: "b", [regionId]: "a" } });

    expect(component.findAll('[role="tab"]').map((tab) => tab.text())).toStrictEqual(["a", "b"]);

    await component.get('[role="tab"][aria-selected="true"]').trigger("keydown", { key: "ArrowRight" });

    expect(component.get('[role="tab"][aria-selected="true"]').text()).toBe("b");
    component.unmount();
  });

  test("selecting an element leaves the canvas where it was", async () => {
    expect.hasAssertions();

    const component = mountShell({ context, layout: overlayLayout });
    const canvasElement = component.get("[data-canvas]").element;
    const canvasWrapper = canvasElement.parentElement;
    assert.exists(canvasWrapper);
    const canvasRow = canvasWrapper.parentElement;
    assert.exists(canvasRow);
    expect(component.find("aside").exists()).toBe(false);

    await component.setProps({ context: selectedContext });

    expect(component.get("[data-canvas]").element).toBe(canvasElement);
    expect(component.get("aside").element.parentElement).toBe(canvasWrapper);
    expect(canvasRow.children).toHaveLength(1);
  });

  test("an overlay column sits clear of an overlay bar", async () => {
    expect.hasAssertions();

    const component = mountShell({ layout: overlayBarLayout });

    expect(component.get("aside").element.style.top).toBe(`${maximumSize}px`);

    await component.setProps({ layout: overlayLayout });

    expect(component.get("aside").element.style.top).toBe("0px");
  });

  test("a compact window opens the panel from a button", async () => {
    expect.hasAssertions();

    display.isCompact = true;
    display.isMobile = true;
    const unselectedComponent = mountShell({ context });

    expect(unselectedComponent.find('[aria-haspopup="dialog"]').exists()).toBe(false);

    const component = mountShell();
    const opener = component.get('[aria-haspopup="dialog"]');

    expect(component.get("dialog").element.open).toBe(false);
    expect(opener.attributes("aria-expanded")).toBe("false");

    await opener.trigger("click");
    await flushPromises();

    expect(component.get("dialog").element.open).toBe(true);
  });

  test("a compact window draws its sheet buttons below the canvas", () => {
    expect.hasAssertions();

    display.isCompact = true;
    display.isMobile = true;
    const component = mountShell();
    const canvasElement = component.get("[data-canvas]").element;
    const canvasWrapper = canvasElement.parentElement;
    assert.exists(canvasWrapper);
    const canvasRow = canvasWrapper.parentElement;
    assert.exists(canvasRow);
    const opener = component.get('[aria-haspopup="dialog"]').element;
    const strip = opener.parentElement;
    assert.exists(strip);

    expect(canvasWrapper.querySelectorAll("button")).toHaveLength(0);
    expect(strip.parentElement).toBe(canvasRow.parentElement);
    expect(strip.previousElementSibling).toBe(canvasRow);
  });

  test("a compact window places the tool region at the bottom", () => {
    expect.hasAssertions();

    const expandedComponent = mountShell({ layout: toolLayout });

    expect(expandedComponent.element.firstElementChild).toBe(expandedComponent.get("aside").element);

    display.isCompact = true;
    display.isMobile = true;
    const compactComponent = mountShell({ layout: toolLayout });

    expect(compactComponent.element.lastElementChild).toBe(compactComponent.get("aside").element);
  });

  test("escape closes a sheet and returns focus", async () => {
    expect.hasAssertions();

    display.isCompact = true;
    display.isMobile = true;
    const component = mountShell();
    const opener = component.get('[aria-haspopup="dialog"]');
    await opener.trigger("click");
    await flushPromises();
    const dialog = component.get<HTMLDialogElement>("dialog").element;
    // Escape asks a modal dialog to cancel, which the dialog hands to its model as a close
    dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
    await flushPromises();

    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(opener.element);
  });
});
