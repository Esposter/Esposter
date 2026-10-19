// @vitest-environment nuxt
import type { BlockDocument } from "headless-block-editor";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { usePageBuilderClipboard } from "@/composables/pageBuilder/usePageBuilderClipboard";
import { PageBuilderEditor } from "@/models/pageBuilder/PageBuilderEditor";
import { TEST_ROOT_TEXT_ID, TEST_TEXT_CONTENT } from "@/services/pageBuilder/constants.test";
import { refuseClipboardPaste } from "@/services/pageBuilder/refuseClipboardPaste";
import { serializeClipboardNodes } from "@/services/pageBuilder/serializeClipboardNodes";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/pageBuilder/refuseClipboardPaste"), async (importOriginal) => {
  const { refuseClipboardPaste: original } = await importOriginal();
  return { refuseClipboardPaste: vi.fn<typeof original>(original) };
});

const REFUSAL_MESSAGE = "A webpage block cannot be pasted into an email";

const createTextNode = (id: string) => ({ props: { content: TEST_TEXT_CONTENT, id }, type: WebpageNodeType.Text });

// A clipboard held in memory, so the text a copy writes is what the next paste reads
const stubClipboard = () => {
  const clipboard = { text: "" };
  vi.stubGlobal("navigator", {
    clipboard: {
      readText: () => Promise.resolve(clipboard.text),
      writeText: (text: string) => {
        clipboard.text = text;
        return Promise.resolve();
      },
    },
  });
  return clipboard;
};

const openResource = async (content: BlockDocument["content"]) => {
  const resourceId = crypto.randomUUID();
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  await pageBuilderDocumentStore.loadDocument(resourceId, () => Promise.resolve({ content, root: TEST_ROOT }));
  return resourceId;
};

describe(usePageBuilderClipboard, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("a node pasted into another webpage appears as a copy", async () => {
    expect.hasAssertions();
    setActivePinia(createPinia());
    stubClipboard();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const sourceId = await openResource([createTextNode(TEST_ROOT_TEXT_ID)]);
    pageBuilderCanvasStore.setSelectedNodeId(sourceId, TEST_ROOT_TEXT_ID);
    await usePageBuilderClipboard(sourceId, vi.fn<(message: string) => void>()).copySelected();

    const targetId = await openResource([]);
    await usePageBuilderClipboard(targetId, vi.fn<(message: string) => void>()).pasteSelected();

    const pastedNode = pageBuilderDocumentStore.getDocument(targetId)?.content[0];
    expect(pastedNode).toStrictEqual({
      props: { content: TEST_TEXT_CONTENT, id: pastedNode?.props.id },
      type: WebpageNodeType.Text,
    });
    expect(pastedNode?.props.id).not.toBe(TEST_ROOT_TEXT_ID);
  });

  test("pasting a webpage node into an email is refused", async () => {
    expect.hasAssertions();
    setActivePinia(createPinia());
    stubClipboard();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const sourceId = await openResource([createTextNode(TEST_ROOT_TEXT_ID)]);
    pageBuilderCanvasStore.setSelectedNodeId(sourceId, TEST_ROOT_TEXT_ID);
    await usePageBuilderClipboard(sourceId, vi.fn<(message: string) => void>()).copySelected();

    const targetId = await openResource([]);
    const announce = vi.fn<(message: string) => void>();
    vi.mocked(refuseClipboardPaste).mockReturnValueOnce(REFUSAL_MESSAGE);
    await usePageBuilderClipboard(targetId, announce).pasteSelected();

    expect(announce.mock.calls).toStrictEqual([[REFUSAL_MESSAGE]]);
    expect(pageBuilderDocumentStore.getDocument(targetId)?.content).toStrictEqual([]);
  });

  test("a clipboard node of a type the webpage lacks is announced as refused", async () => {
    expect.hasAssertions();
    setActivePinia(createPinia());
    const clipboard = stubClipboard();
    clipboard.text = serializeClipboardNodes({
      editor: PageBuilderEditor.Webpage,
      nodes: [{ props: { id: "unknown-node-id" }, type: "UnknownNodeType" }],
    });
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const targetId = await openResource([]);
    const announce = vi.fn<(message: string) => void>();
    await usePageBuilderClipboard(targetId, announce).pasteSelected();

    expect(announce.mock.calls).toStrictEqual([["This block cannot go here"]]);
    expect(pageBuilderDocumentStore.getDocument(targetId)?.content).toStrictEqual([]);
  });

  test("copy with a denied clipboard changes nothing", async () => {
    expect.hasAssertions();
    setActivePinia(createPinia());
    vi.stubGlobal("navigator", { clipboard: { writeText: () => Promise.reject(new Error("denied")) } });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const resourceId = await openResource([createTextNode(TEST_ROOT_TEXT_ID)]);
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    const announce = vi.fn<(message: string) => void>();
    await usePageBuilderClipboard(resourceId, announce).copySelected();

    expect(announce.mock.calls).toStrictEqual([["Could not copy block"]]);
    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content).toStrictEqual([
      createTextNode(TEST_ROOT_TEXT_ID),
    ]);
  });
});
