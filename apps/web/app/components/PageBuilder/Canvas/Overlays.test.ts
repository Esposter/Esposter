// @vitest-environment nuxt
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID } from "#shared/services/pageBuilder/constants.test";
import PageBuilderCanvasOverlays from "#src/components/PageBuilder/Canvas/Overlays.vue";
import { WEBPAGE_NODE_TYPE_TITLE_MAP } from "#src/services/pageBuilder/constants";
import { TEST_TEXT_CONTENT } from "#src/services/pageBuilder/constants.test";
import { webpageKind } from "#src/services/pageBuilder/webpageKind";
import { DRAG_PREVIEW_NODE_ID } from "#src/services/pageBuilder/withDragPreview";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test, vi } from "vitest";

// A page holding one text node under the test id, the node the hover outline names
const setTextDocument = () => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
    content: [{ props: { content: TEST_TEXT_CONTENT, elementId: "", id: TEST_ID }, type: WebpageNodeType.Text }],
    root: { props: { lang: "en", tokens: {} } },
  });
};

describe("pageBuilderCanvasOverlays", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const TEXT_TITLE = WEBPAGE_NODE_TYPE_TITLE_MAP[WebpageNodeType.Text];

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

        draggedNodeId: "",
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

        draggedNodeId: "",
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

        draggedNodeId: "",
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

  test("a dragged block is outlined where its preview is drawn, in place of the drop line", async () => {
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

        draggedNodeId: "",
        dropTarget: { index: 0, slotPointer: "/content" },
        getElement: (nodeId) => (nodeId === DRAG_PREVIEW_NODE_ID ? element : null),
        hoveredNodeId: "",
        resourceId: TEST_ID,
        selectedNodeId: "",
      },
    });
    await nextTick();

    expect(component.get<HTMLElement>("[data-outline='preview']").element.style.left).toBe("120px");
    expect(component.find("[data-drop-indicator]").exists()).toBe(false);
  });

  test("hovering a text node names it on its outline", async () => {
    expect.hasAssertions();

    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    const element = document.createElement("div");
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue(new DOMRect(120, 40, 80, 20));
    setTextDocument();

    const component = await mountSuspended(PageBuilderCanvasOverlays, {
      props: {
        checkIsHorizontalOwner: () => false,

        draggedNodeId: "",
        getElement: () => element,
        hoveredNodeId: TEST_ID,
        resourceId: TEST_ID,
        selectedNodeId: "",
      },
    });
    await nextTick();

    expect(component.get("[data-outline-label]").text()).toBe(TEXT_TITLE);
  });

  test("a node at the top edge of the canvas shows its name", async () => {
    expect.hasAssertions();

    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    const element = document.createElement("div");
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue(new DOMRect(120, 0, 80, 20));
    setTextDocument();

    const component = await mountSuspended(PageBuilderCanvasOverlays, {
      props: {
        checkIsHorizontalOwner: () => false,

        draggedNodeId: "",
        getElement: () => element,
        hoveredNodeId: TEST_ID,
        resourceId: TEST_ID,
        selectedNodeId: "",
      },
    });
    await nextTick();

    const label = component.get<HTMLElement>("[data-outline-label]").element;

    expect(label.textContent).toBe(TEXT_TITLE);
    expect(label.style.left).toBe("120px");
    expect(label.style.top).toBe("0px");
  });

  test("the name leaves when the pointer leaves the node", async () => {
    expect.hasAssertions();

    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    const element = document.createElement("div");
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue(new DOMRect(120, 40, 80, 20));
    setTextDocument();

    const component = await mountSuspended(PageBuilderCanvasOverlays, {
      props: {
        checkIsHorizontalOwner: () => false,

        draggedNodeId: "",
        getElement: () => element,
        hoveredNodeId: TEST_ID,
        resourceId: TEST_ID,
        selectedNodeId: "",
      },
    });
    await nextTick();

    expect(component.get("[data-outline-label]").text()).toBe(TEXT_TITLE);

    await component.setProps({ hoveredNodeId: "" });
    await nextTick();

    expect(component.find("[data-outline-label]").exists()).toBe(false);
  });
});
