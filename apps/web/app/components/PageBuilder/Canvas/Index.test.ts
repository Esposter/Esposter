// @vitest-environment nuxt
import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { DEVICE_WIDTH_MAP } from "#shared/services/pageBuilder/constants";
import { TEST_ID, TEST_OTHER_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { MAX_EMAIL_NODES } from "#shared/services/pageBuilder/email/constants";
import { emailBodyChildrenSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { noteRichText } from "#shared/services/pageBuilder/email/noteRichText";
import PageBuilderCanvas from "#src/components/PageBuilder/Canvas/Index.vue";
import { TEST_ROOT_TEXT_ID, TEST_TEXT_CONTENT } from "#src/services/pageBuilder/constants.test";
import { emailKind } from "#src/services/pageBuilder/emailKind";
import { TOOLBAR_HEIGHT } from "#src/services/pageBuilder/getToolbarPlacement";
import { webpageKind } from "#src/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "#src/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { parseMjmlDocument } from "mjml-blocks";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

// Enter begins a text edit through the key commands, which set the edit the way this helper does
const beginTextEdit = async () => {
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  pageBuilderCanvasStore.setEditingNodeId(TEST_ID, TEST_ROOT_TEXT_ID);
  await nextTick();
};

describe("pageBuilderCanvas", () => {
  const TABLET_WIDTH = `${DEVICE_WIDTH_MAP[PageBuilderDevice.Tablet]}px`;
  // The text node sits this far below the frame's top, so the room above it is the toolbar's to take
  const TEXT_TOP = 200;
  const FRAME_RECT = new DOMRect(0, 0, 800, 600);
  const TEXT_RECT = new DOMRect(0, TEXT_TOP, 300, 100);

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(window, "frameElement");
  });

  // The canvas's frame is an iframe whose page cannot be unmounted once it is attached in happy-dom, so the frame is drawn
  // As its own slot, in the app's document, and the toolbars are placed from a frame element and rects given here
  const FrameStub = defineComponent(
    (_props, { slots }) =>
      () =>
        h("div", slots.default?.()),
  );
  const mountSelectedText = async () => {
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
      content: [
        { props: { content: TEST_TEXT_CONTENT, elementId: "", id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text },
      ],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_ROOT_TEXT_ID);
    Object.defineProperty(window, "frameElement", { configurable: true, value: document.createElement("iframe") });
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      return this.dataset.nodeId ? TEXT_RECT : FRAME_RECT;
    });
    const component = await mountSuspended(PageBuilderCanvas, {
      attachTo: document.body,
      global: { stubs: { PageBuilderCanvasFrame: FrameStub } },
      props: {
        announce: vi.fn<(message: string) => void>(),
        draggedNodeId: "",
        kind: webpageKind,
        resourceId: TEST_ID,

        startNodeDrag: noop,
      },
    });
    // The app places the toolbar and the overlay outlines the node, each on the animation frame after a scroll, so the mount
    // Waits for that frame
    window.dispatchEvent(new Event("scroll"));
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
    await nextTick();
    return component;
  };

  test("switching to tablet draws the page at tablet width", async () => {
    expect.hasAssertions();

    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
      content: [
        {
          props: {
            content: { content: [{ content: [{ text: "a", type: "text" }], type: "paragraph" }], type: "doc" },
            elementId: "",
            id: TEST_OTHER_ID,
          },
          type: WebpageNodeType.Text,
        },
      ],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setDevice(TEST_ID, PageBuilderDevice.Tablet);

    const component = await mountSuspended(PageBuilderCanvas, {
      props: {
        announce: vi.fn<(message: string) => void>(),
        draggedNodeId: "",
        kind: webpageKind,
        resourceId: TEST_ID,

        startNodeDrag: noop,
      },
    });

    expect(component.get<HTMLIFrameElement>("iframe").element.style.width).toBe(TABLET_WIDTH);
  });

  test("switching to tablet draws the email at tablet width", async () => {
    expect.hasAssertions();

    const result = parseMjmlDocument(
      `<mjml><mj-body><mj-section><mj-column><mj-text>a</mj-text></mj-column></mj-section></mj-body></mjml>`,
      emailRegistry,
      emailBodyChildrenSchema,
      noteRichText,
      MAX_EMAIL_NODES,
    );
    if (!result.success) throw new Error("the test email should parse");

    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setEmailDocument(TEST_ID, emailKind, result.data);
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setDevice(TEST_ID, PageBuilderDevice.Tablet);

    const component = await mountSuspended(PageBuilderCanvas, {
      props: {
        announce: vi.fn<(message: string) => void>(),
        draggedNodeId: "",
        kind: emailKind,
        resourceId: TEST_ID,

        startNodeDrag: noop,
      },
    });

    expect(component.get<HTMLIFrameElement>("iframe").element.style.width).toBe(TABLET_WIDTH);
  });

  test("a page with no document draws nothing", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(PageBuilderCanvas, {
      props: {
        announce: vi.fn<(message: string) => void>(),
        draggedNodeId: "",
        kind: webpageKind,
        resourceId: TEST_ID,

        startNodeDrag: noop,
      },
    });

    expect(component.find("iframe").exists()).toBe(false);
  });

  test("entering text edit shows the formatting toolbar over the text", async () => {
    expect.hasAssertions();

    const component = await mountSelectedText();
    await beginTextEdit();

    // The link control's Apply button sits in its own popover form, which is not one of the toolbar's controls
    const toolbarButtons = component.findAll("button").filter((button) => button.element.closest("form") === null);
    expect(toolbarButtons.map((button) => button.attributes("aria-label"))).toStrictEqual([
      "Paragraph",
      "Heading 1",
      "Heading 2",
      "Heading 3",
      "Blockquote",
      "Bold",
      "Italic",
      "Code",
      "Bullet List",
      "Ordered List",
      "Link",
    ]);
  });

  test("leaving the text edit hides the text toolbar", async () => {
    expect.hasAssertions();

    const component = await mountSelectedText();
    await beginTextEdit();
    expect(component.find("button[aria-label='Bold']").exists()).toBe(true);

    // Escape is pressed in the text editor, which ends the edit the way the editor's own keydown does
    await component.get("[data-text-editor]").trigger("keydown", { key: "Escape" });

    expect(component.find("button[aria-label='Bold']").exists()).toBe(false);
  });

  test("the node toolbar gives way to the text toolbar while editing", async () => {
    expect.hasAssertions();

    const component = await mountSelectedText();
    expect(component.find("button[aria-label='Select parent']").exists()).toBe(true);

    await beginTextEdit();

    expect(component.find("button[aria-label='Select parent']").exists()).toBe(false);
    expect(component.find("button[aria-label='Bold']").exists()).toBe(true);
  });

  test("the text toolbar sits above its text when the canvas has room", async () => {
    expect.hasAssertions();

    const component = await mountSelectedText();
    await beginTextEdit();

    const toolbar = component.get("button[aria-label='Bold']").element.closest<HTMLElement>("div[style]");
    assert.exists(toolbar);
    expect(toolbar.style.top).toBe(`${TEXT_TOP - TOOLBAR_HEIGHT}px`);
  });
});
