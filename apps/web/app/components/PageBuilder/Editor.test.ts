// @vitest-environment nuxt
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import {
  TEST_ID,
  TEST_LABEL,
  TEST_OTHER_ID,
  TEST_ROOT,
  TEST_SURVEY_ID,
  TEST_URL,
} from "#shared/services/pageBuilder/constants.test";
import {
  createTestSurveyInviteNode,
  createTestTextNode,
  TEST_GREY_RGB_VALUE,
} from "#shared/services/pageBuilder/critique/constants.test";
import PageBuilderCanvas from "@/components/PageBuilder/Canvas/Index.vue";
import PageBuilderCanvasFrame from "@/components/PageBuilder/Canvas/Frame.vue";
import PageBuilderEditor from "@/components/PageBuilder/Editor.vue";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import {
  DEVICE_BREAKPOINT_MAP,
  WEBPAGE_NODE_TYPE_TITLE_MAP,
  WEBPAGE_PALETTE_CATEGORIES,
} from "@/services/pageBuilder/constants";
import {
  TEST_NESTED_TEXT_ID,
  TEST_ROOT_TEXT_ID,
  TEST_SECTION_ID,
  TEST_TEXT_CONTENT,
} from "@/services/pageBuilder/constants.test";
import { PAGE_BUILDER_REGION_ID_MAP, PAGE_BUILDER_REGION_NAME_MAP } from "@/services/pageBuilder/pageBuilderLayout";
import { parseClipboardNodes } from "@/services/pageBuilder/serializeClipboardNodes";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "@/services/resource/constants";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, onTestFinished, test, vi } from "vitest";

// The editor's keys are bound on the page's window, so a key is pressed on the element that has focus and bubbles up to it
const pressKey = (init: KeyboardEventInit, target: EventTarget = document.body) => {
  target.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, ...init }));
  return nextTick();
};
// The size class is read from the display composable, so a test says how small the window is before the editor mounts
const display = vi.hoisted(() => ({ isCompact: false, isMobile: false }));
vi.mock(import("@/composables/ui/useUiDisplay"), () => ({
  useUiDisplay: () => ({ isMobile: shallowRef(display.isMobile), xs: shallowRef(display.isCompact) }),
}));

describe("pageBuilderEditor", () => {
  const { trpcMsw } = setupMswTrpc();
  // The settings tabs are the inspector's, which the layout names by its region's name
  const settingsTabs = `[role="tablist"][aria-label="${PAGE_BUILDER_REGION_NAME_MAP[PAGE_BUILDER_REGION_ID_MAP.Inspector]}"] [role="tab"]`;
  const problemRows = '[role="dialog"] button';

  beforeEach(() => {
    display.isCompact = false;
    display.isMobile = false;
    localStorage.clear();
    trpcMsw.survey.readResources.query(() => ({ hasMore: false, items: [] }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("the editor draws the palette, the canvas and the content panel", async () => {
    expect.hasAssertions();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [
        {
          props: {
            children: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_NESTED_TEXT_ID }, type: WebpageNodeType.Text }],
            id: TEST_SECTION_ID,
            tag: HtmlTag.Section,
          },
          type: WebpageNodeType.Section,
        },
      ],
      root: TEST_ROOT,
    });

    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    expect(component.findAll("button[aria-expanded]").map((heading) => heading.text())).toStrictEqual(
      WEBPAGE_PALETTE_CATEGORIES.map(({ category }) => category),
    );
    expect(component.find("iframe").exists()).toBe(true);
  });

  test("nothing selected offers Page and Theme", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, { content: [], root: TEST_ROOT });

    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    expect(component.findAll(settingsTabs).map((tab) => tab.text())).toStrictEqual(["Page", "Theme"]);
  });

  test("a node selection offers Content and Style only", async () => {
    expect.hasAssertions();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text }],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);

    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    expect(component.findAll(settingsTabs).map((tab) => tab.text())).toStrictEqual(["Content", "Style"]);
  });

  test("the Check tab is gone", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, { content: [], root: TEST_ROOT });

    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    expect(component.findAll('[role="tab"]').map((tab) => tab.text())).toStrictEqual([
      "Blocks",
      "Layers",
      "Page",
      "Theme",
    ]);
  });

  test("the device toggle sets the frame and the style tab's breakpoint", async () => {
    expect.hasAssertions();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text }],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    pageBuilderCanvasStore.setDevice(resourceId, PageBuilderDevice.Desktop);
    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    const mobile = component.findAll('[role="radio"]').find((option) => option.text() === "Mobile");
    await mobile?.trigger("click");

    expect(component.findComponent(PageBuilderCanvasFrame).props("device")).toBe(PageBuilderDevice.Mobile);
    expect(DEVICE_BREAKPOINT_MAP[pageBuilderCanvasStore.getDevice(resourceId)]).toBe(StyleBreakpoint.Mobile);
  });

  test("a compact window opens the inspector as a sheet", async () => {
    expect.hasAssertions();
    display.isCompact = true;
    display.isMobile = true;
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text }],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });
    const inspector = component.get(`dialog[data-placement="${UiDialogPlacement.DrawerEnd}"]`);

    expect(inspector.element.open).toBe(false);

    const settingsButton = component
      .findAll("button")
      .find((button) => button.text() === PAGE_BUILDER_REGION_NAME_MAP[PAGE_BUILDER_REGION_ID_MAP.Inspector]);
    await settingsButton?.trigger("click");
    await flushPromises();

    expect(inspector.element.open).toBe(true);
    expect(component.find("iframe").exists()).toBe(true);
  });

  test("a critique finding is a warning in the problems surface", async () => {
    expect.hasAssertions();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [
        createTestTextNode(TEST_OTHER_ID, {
          [StyleBreakpoint.Base]: { [StyleState.Default]: { color: TEST_GREY_RGB_VALUE } },
        }),
      ],
      root: TEST_ROOT,
    });

    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    expect(component.findAll(problemRows).map((row) => row.text())).toStrictEqual([
      "Text Contrast 1.61 to 1, under the 4.5 to 1 a text needs",
    ]);
  });

  test("choosing a finding in the problems surface selects the node it names", async () => {
    expect.hasAssertions();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [
        createTestTextNode(TEST_OTHER_ID, {
          [StyleBreakpoint.Base]: { [StyleState.Default]: { color: TEST_GREY_RGB_VALUE } },
        }),
      ],
      root: TEST_ROOT,
    });
    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    await takeOne(component.findAll(problemRows)).trigger("click");

    expect(pageBuilderCanvasStore.getSelectedNodeId(resourceId)).toBe(TEST_OTHER_ID);
  });

  test("an unsaved edit changes the findings", async () => {
    expect.hasAssertions();
    // The findings settle on the autosave's cadence, so the test moves the clock past it rather than waiting for it
    vi.useFakeTimers({ now: 0, toFake: ["setTimeout", "clearTimeout"] });
    onTestFinished(() => {
      vi.useRealTimers();
    });
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [createTestTextNode(TEST_OTHER_ID, {})],
      root: TEST_ROOT,
    });
    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });
    const findingsBeforeEdit = component.findAll(problemRows).map((row) => row.text());
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [
        createTestTextNode(TEST_OTHER_ID, {
          [StyleBreakpoint.Base]: { [StyleState.Default]: { color: TEST_GREY_RGB_VALUE } },
        }),
      ],
      root: TEST_ROOT,
    });
    vi.advanceTimersByTime(RESOURCE_AUTOSAVE_DEBOUNCE_MS);
    await nextTick();

    expect(findingsBeforeEdit).toStrictEqual([]);
    expect(component.findAll(problemRows).map((row) => row.text())).toStrictEqual([
      "Text Contrast 1.61 to 1, under the 4.5 to 1 a text needs",
    ]);
  });

  test("an invite to an unpublished survey is a warning", async () => {
    expect.hasAssertions();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [createTestSurveyInviteNode(TEST_OTHER_ID, TEST_SURVEY_ID)],
      root: TEST_ROOT,
    });
    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });
    await flushPromises();

    expect(component.findAll(problemRows).map((row) => row.text())).toStrictEqual([
      "Survey invite Invite to a survey with no published version",
    ]);
  });

  test("a document with no survey invite reads no survey list", async () => {
    expect.hasAssertions();
    const readResources = vi.fn<() => { hasMore: false; items: [] }>(() => ({ hasMore: false, items: [] }));
    trpcMsw.survey.readResources.query(readResources);
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [createTestTextNode(TEST_OTHER_ID, {})],
      root: TEST_ROOT,
    });
    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });
    await flushPromises();

    expect(readResources).not.toHaveBeenCalled();
    expect(component.findAll(problemRows)).toHaveLength(0);
  });

  test("a block can be moved with the keyboard alone", async () => {
    expect.hasAssertions();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [
        { props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text },
        { props: { content: TEST_TEXT_CONTENT, id: TEST_OTHER_ID }, type: WebpageNodeType.Text },
      ],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    await pressKey({ altKey: true, key: "ArrowDown" });

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content.map(({ props }) => props.id)).toStrictEqual([
      TEST_OTHER_ID,
      TEST_ROOT_TEXT_ID,
    ]);
  });

  test("delete removes the selected node", async () => {
    expect.hasAssertions();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [
        { props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text },
        { props: { content: TEST_TEXT_CONTENT, id: TEST_OTHER_ID }, type: WebpageNodeType.Text },
      ],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    await pressKey({ key: "Delete" });

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content.map(({ props }) => props.id)).toStrictEqual([
      TEST_OTHER_ID,
    ]);
  });

  test("a key typed into a text field is no edit key", async () => {
    expect.hasAssertions();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [
        { props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text },
        { props: { content: TEST_TEXT_CONTENT, id: TEST_OTHER_ID }, type: WebpageNodeType.Text },
      ],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });
    const input = document.createElement("input");
    document.body.append(input);
    onTestFinished(() => {
      input.remove();
    });
    input.focus();

    await pressKey({ key: "Delete" }, input);

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content.map(({ props }) => props.id)).toStrictEqual([
      TEST_ROOT_TEXT_ID,
      TEST_OTHER_ID,
    ]);
  });

  test("a move announces its result in the live region", async () => {
    expect.hasAssertions();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [
        { props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text },
        { props: { content: TEST_TEXT_CONTENT, id: TEST_OTHER_ID }, type: WebpageNodeType.Text },
      ],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    await pressKey({ altKey: true, key: "ArrowDown" });
    await nextTick();

    expect(component.get('[role="status"]').text()).toBe(
      `Moved ${WEBPAGE_NODE_TYPE_TITLE_MAP[WebpageNodeType.Text]} 2 to position 2 of 2 in The page`,
    );
  });

  test("enter edits a selected text node in place", async () => {
    expect.hasAssertions();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text }],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    await component.trigger("keydown", { key: "Enter" });

    expect(pageBuilderCanvasStore.getEditingNodeId(resourceId)).toBe(TEST_ROOT_TEXT_ID);
  });

  test("enter does nothing on a button", async () => {
    expect.hasAssertions();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [{ props: { href: TEST_URL, id: TEST_ID, label: TEST_LABEL }, type: WebpageNodeType.Button }],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    await component.trigger("keydown", { key: "Enter" });

    expect(pageBuilderCanvasStore.getEditingNodeId(resourceId)).toBe("");
  });

  test("enter on a focused button activates it rather than editing the selected text", async () => {
    expect.hasAssertions();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text }],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    await component.get("button").trigger("keydown", { key: "Enter" });

    expect(pageBuilderCanvasStore.getEditingNodeId(resourceId)).toBe("");
  });

  test("enter on a button in the canvas frame activates it rather than editing the selected text", async () => {
    expect.hasAssertions();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text }],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });
    // An element of the frame's document comes from another realm, so it fails instanceof Element against this window's
    const frameButton: { closest: () => unknown; tagName: string } = { closest: () => frameButton, tagName: "BUTTON" };
    const event = new KeyboardEvent("keydown", { key: "Enter" });
    Object.defineProperty(event, "target", { value: frameButton });

    component.findComponent(PageBuilderCanvas).vm.$emit("canvasKeydown", event);

    expect(pageBuilderCanvasStore.getEditingNodeId(resourceId)).toBe("");
  });

  test("leaving a text edit focuses the node's row in the layers tree", async () => {
    expect.hasAssertions();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text }],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    const component = await mountSuspended(PageBuilderEditor, {
      attachTo: document.body,
      props: { kind: webpageKind, resourceId },
    });
    pageBuilderCanvasStore.setEditingNodeId(resourceId, TEST_ROOT_TEXT_ID);
    await nextTick();

    pageBuilderCanvasStore.setEditingNodeId(resourceId, "");
    await flushPromises();

    expect(document.activeElement).toBe(component.get(`[data-item-id="${TEST_ROOT_TEXT_ID}"]`).element);
    component.unmount();
  });

  test("a keydown forwarded from the canvas deletes the selected node", async () => {
    expect.hasAssertions();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [
        { props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text },
        { props: { content: TEST_TEXT_CONTENT, id: TEST_OTHER_ID }, type: WebpageNodeType.Text },
      ],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    component
      .findComponent(PageBuilderCanvas)
      .vm.$emit("canvasKeydown", new KeyboardEvent("keydown", { key: "Delete" }));

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content.map(({ props }) => props.id)).toStrictEqual([
      TEST_OTHER_ID,
    ]);
  });

  test("a keydown forwarded from the canvas starts a text edit on enter", async () => {
    expect.hasAssertions();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text }],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    component
      .findComponent(PageBuilderCanvas)
      .vm.$emit("canvasKeydown", new KeyboardEvent("keydown", { key: "Enter" }));

    expect(pageBuilderCanvasStore.getEditingNodeId(resourceId)).toBe(TEST_ROOT_TEXT_ID);
  });

  test("ctrl C copies the selected node to the clipboard", async () => {
    expect.hasAssertions();
    const writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text }],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    await pressKey({ ctrlKey: true, key: "c" });

    expect(
      writeText.mock.calls.map(([text]) => parseClipboardNodes(webpageKind, text)?.nodes.map(({ props }) => props.id)),
    ).toStrictEqual([[TEST_ROOT_TEXT_ID]]);
  });

  test("an empty page shows its empty state instead of the canvas", async () => {
    expect.hasAssertions();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, { content: [], root: TEST_ROOT });

    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    expect(component.find("iframe").exists()).toBe(false);
    expect(component.text()).toContain("This page is empty");
  });
});
