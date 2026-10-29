// @vitest-environment nuxt
import { TEST_ID } from "#shared/services/pageBuilder/constants.test";
import PageBuilderCanvasOverlays from "@/components/PageBuilder/Canvas/Overlays.vue";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test, vi } from "vitest";

describe("pageBuilderCanvasOverlays", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("hovering a node outlines it", async () => {
    expect.hasAssertions();

    // A frame's animation frame runs at once here, so the outline is drawn before the assertion reads it
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    const element = document.createElement("div");
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue(new DOMRect(120, 40, 80, 20));
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
      content: [],
      root: { props: { lang: "en", tokens: {} } },
    });

    const component = await mountSuspended(PageBuilderCanvasOverlays, {
      props: {
        checkIsHorizontalOwner: () => false,
        getElement: () => element,
        hoveredNodeId: TEST_ID,
        resourceId: TEST_ID,
        selectedNodeId: "",
      },
    });
    await nextTick();

    const outline = component.get<HTMLElement>("[data-outline='hover']").element;

    expect(outline.style.left).toBe("120px");
    expect(outline.style.top).toBe("40px");
  });

  test("a selected node gets a selection outline, not a hover one", async () => {
    expect.hasAssertions();

    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    const element = document.createElement("div");
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue(new DOMRect(120, 40, 80, 20));
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
      content: [],
      root: { props: { lang: "en", tokens: {} } },
    });

    const component = await mountSuspended(PageBuilderCanvasOverlays, {
      props: {
        checkIsHorizontalOwner: () => false,
        getElement: () => element,
        hoveredNodeId: "",
        resourceId: TEST_ID,
        selectedNodeId: TEST_ID,
      },
    });
    await nextTick();

    expect(component.find("[data-outline='selection']").exists()).toBe(true);
    expect(component.find("[data-outline='hover']").exists()).toBe(false);
  });

  test("a hovered node is outlined in a frame attached to the document", async () => {
    expect.hasAssertions();

    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    const element = document.createElement("div");
    document.body.append(element);
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue(new DOMRect(120, 40, 80, 20));
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
      content: [],
      root: { props: { lang: "en", tokens: {} } },
    });

    const component = await mountSuspended(PageBuilderCanvasOverlays, {
      attachTo: document.body,
      props: {
        checkIsHorizontalOwner: () => false,
        getElement: () => element,
        hoveredNodeId: TEST_ID,
        resourceId: TEST_ID,
        selectedNodeId: "",
      },
    });
    await nextTick();

    expect(component.get<HTMLElement>("[data-outline='hover']").element.style.left).toBe("120px");
    element.remove();
  });
});
