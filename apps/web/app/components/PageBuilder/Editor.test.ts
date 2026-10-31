// @vitest-environment nuxt
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL, TEST_OTHER_ID, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import PageBuilderCanvas from "@/components/PageBuilder/Canvas/Index.vue";
import PageBuilderEditor from "@/components/PageBuilder/Editor.vue";
import { WEBPAGE_NODE_TYPE_TITLE_MAP, WEBPAGE_PALETTE_CATEGORIES } from "@/services/pageBuilder/constants";
import {
  TEST_NESTED_TEXT_ID,
  TEST_ROOT_TEXT_ID,
  TEST_SECTION_ID,
  TEST_TEXT_CONTENT,
} from "@/services/pageBuilder/constants.test";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { parseClipboardNodes } from "@/services/pageBuilder/serializeClipboardNodes";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test, vi } from "vitest";

describe("pageBuilderEditor", () => {
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

    expect(component.findAll("h3").map((heading) => heading.text())).toStrictEqual(
      WEBPAGE_PALETTE_CATEGORIES.map(({ category }) => category),
    );
    expect(component.find("iframe").exists()).toBe(true);
    expect(component.get('[role="tab"]').text()).toBe("Content");
  });

  test("an email's settings tabs leave out the theme, which an email has no controls for", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setEmailDocument(resourceId, emailKind, { content: [], root: { props: {} } });

    const component = await mountSuspended(PageBuilderEditor, { props: { kind: emailKind, resourceId } });

    expect(component.findAll('[role="tab"]').map((tab) => tab.text())).toStrictEqual(["Content", "Style"]);
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
    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    await component.trigger("keydown", { altKey: true, key: "ArrowDown" });

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
    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    await component.trigger("keydown", { key: "Delete" });

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content.map(({ props }) => props.id)).toStrictEqual([
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

    await component.trigger("keydown", { altKey: true, key: "ArrowDown" });
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
    await nextTick();

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
    const component = await mountSuspended(PageBuilderEditor, { props: { kind: webpageKind, resourceId } });

    await component.trigger("keydown", { ctrlKey: true, key: "c" });

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
