// @vitest-environment nuxt
import type { TextNode } from "#shared/models/pageBuilder/TextNode";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { usePageBuilderClipboard } from "@/composables/pageBuilder/usePageBuilderClipboard";
import { usePageBuilderMoves } from "@/composables/pageBuilder/usePageBuilderMoves";
import { PageBuilderEditor } from "@/models/pageBuilder/PageBuilderEditor";
import { CANNOT_GO_HERE_MESSAGE } from "@/services/pageBuilder/constants";
import { TEST_ROOT_TEXT_ID, TEST_TEXT_CONTENT } from "@/services/pageBuilder/constants.test";
import { refuseClipboardPaste } from "@/services/pageBuilder/refuseClipboardPaste";
import { serializeClipboardNodes } from "@/services/pageBuilder/serializeClipboardNodes";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/pageBuilder/refuseClipboardPaste"), async (importOriginal) => {
  const { refuseClipboardPaste: original } = await importOriginal();
  return { refuseClipboardPaste: vi.fn<typeof original>(original) };
});

const createTextNode = (id: string): TextNode => ({
  props: { content: TEST_TEXT_CONTENT, id },
  type: WebpageNodeType.Text,
});

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

// The clipboard of an open webpage, read from the document store the way the shell reads it
const createClipboard = (
  resourceId: string,
  announce: (message: string) => void,
  deleteNode: (nodeId: string) => boolean,
) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  return usePageBuilderClipboard(
    webpageKind,
    () => pageBuilderDocumentStore.getDocument(resourceId),
    resourceId,
    announce,
    deleteNode,
  );
};

const openResource = (content: WebpageDocument["content"]) => {
  const resourceId = crypto.randomUUID();
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  pageBuilderDocumentStore.setDocument(resourceId, webpageKind, { content, root: TEST_ROOT });
  return resourceId;
};

describe(usePageBuilderClipboard, () => {
  const REFUSAL_MESSAGE = "a";
  // A type name no webpage node holds, written over a copied text node's tag in the clipboard text
  const UNKNOWN_NODE_TYPE = "UnknownNodeType";

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("a node pasted into another webpage appears as a copy", async () => {
    expect.hasAssertions();
    stubClipboard();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const sourceId = openResource([createTextNode(TEST_ROOT_TEXT_ID)]);
    pageBuilderCanvasStore.setSelectedNodeId(sourceId, TEST_ROOT_TEXT_ID);
    await createClipboard(
      sourceId,
      vi.fn<(message: string) => void>(),
      vi.fn<(nodeId: string) => boolean>(),
    ).copySelected();

    const targetId = openResource([]);
    await createClipboard(
      targetId,
      vi.fn<(message: string) => void>(),
      vi.fn<(nodeId: string) => boolean>(),
    ).pasteSelected();

    const pastedNode = pageBuilderDocumentStore.getDocument(targetId)?.content[0];
    expect(pastedNode).toStrictEqual({
      props: { content: TEST_TEXT_CONTENT, id: pastedNode?.props.id },
      type: WebpageNodeType.Text,
    });
    expect(pastedNode?.props.id).not.toBe(TEST_ROOT_TEXT_ID);
  });

  test("pasting a webpage node into an email is refused", async () => {
    expect.hasAssertions();
    stubClipboard();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const sourceId = openResource([createTextNode(TEST_ROOT_TEXT_ID)]);
    pageBuilderCanvasStore.setSelectedNodeId(sourceId, TEST_ROOT_TEXT_ID);
    await createClipboard(
      sourceId,
      vi.fn<(message: string) => void>(),
      vi.fn<(nodeId: string) => boolean>(),
    ).copySelected();

    const targetId = openResource([]);
    const announce = vi.fn<(message: string) => void>();
    vi.mocked(refuseClipboardPaste).mockReturnValueOnce(REFUSAL_MESSAGE);
    await createClipboard(targetId, announce, vi.fn<(nodeId: string) => boolean>()).pasteSelected();

    expect(announce.mock.calls).toStrictEqual([[REFUSAL_MESSAGE]]);
    expect(pageBuilderDocumentStore.getDocument(targetId)?.content).toStrictEqual([]);
  });

  test("empty clipboard text is announced as a block that cannot go here on paste", async () => {
    expect.hasAssertions();
    stubClipboard();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const targetId = openResource([]);
    const announce = vi.fn<(message: string) => void>();
    await createClipboard(targetId, announce, vi.fn<(nodeId: string) => boolean>()).pasteSelected();

    expect(announce.mock.calls).toStrictEqual([[CANNOT_GO_HERE_MESSAGE]]);
    expect(pageBuilderDocumentStore.getDocument(targetId)?.content).toStrictEqual([]);
  });

  test("a clipboard node of a type no webpage holds is announced as a block that cannot go here on paste", async () => {
    expect.hasAssertions();
    const clipboard = stubClipboard();
    clipboard.text = serializeClipboardNodes({
      editor: PageBuilderEditor.Webpage,
      nodes: [createTextNode(TEST_ROOT_TEXT_ID)],
    }).replace(`"type":"${WebpageNodeType.Text}"`, `"type":"${UNKNOWN_NODE_TYPE}"`);
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const targetId = openResource([]);
    const announce = vi.fn<(message: string) => void>();
    await createClipboard(targetId, announce, vi.fn<(nodeId: string) => boolean>()).pasteSelected();

    expect(announce.mock.calls).toStrictEqual([[CANNOT_GO_HERE_MESSAGE]]);
    expect(pageBuilderDocumentStore.getDocument(targetId)?.content).toStrictEqual([]);
  });

  test("cut deletes the node it copied when the selection moves while the clipboard write waits", async () => {
    expect.hasAssertions();
    const writeGate = Promise.withResolvers<void>();
    vi.stubGlobal("navigator", { clipboard: { writeText: () => writeGate.promise } });
    const otherNodeId = crypto.randomUUID();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const resourceId = openResource([createTextNode(TEST_ROOT_TEXT_ID), createTextNode(otherNodeId)]);
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    const { deleteNode } = usePageBuilderMoves(
      webpageKind,
      () => pageBuilderDocumentStore.getDocument(resourceId),
      resourceId,
      vi.fn<(message: string) => void>(),
    );
    const cut = createClipboard(resourceId, vi.fn<(message: string) => void>(), deleteNode).cutSelected();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, otherNodeId);
    writeGate.resolve();
    await cut;

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content).toStrictEqual([createTextNode(otherNodeId)]);
  });

  test("cut announces nothing when the node is deleted while the clipboard write waits", async () => {
    expect.hasAssertions();
    const writeGate = Promise.withResolvers<void>();
    vi.stubGlobal("navigator", { clipboard: { writeText: () => writeGate.promise } });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const resourceId = openResource([createTextNode(TEST_ROOT_TEXT_ID)]);
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    const { deleteNode } = usePageBuilderMoves(
      webpageKind,
      () => pageBuilderDocumentStore.getDocument(resourceId),
      resourceId,
      vi.fn<(message: string) => void>(),
    );
    const announce = vi.fn<(message: string) => void>();
    const cut = createClipboard(resourceId, announce, deleteNode).cutSelected();
    deleteNode(TEST_ROOT_TEXT_ID);
    writeGate.resolve();
    await cut;

    expect(announce.mock.calls).toStrictEqual([]);
  });

  test("copy with a denied clipboard changes nothing", async () => {
    expect.hasAssertions();
    vi.stubGlobal("navigator", { clipboard: { writeText: () => Promise.reject(new Error(" ")) } });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const resourceId = openResource([createTextNode(TEST_ROOT_TEXT_ID)]);
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    const announce = vi.fn<(message: string) => void>();
    await createClipboard(resourceId, announce, vi.fn<(nodeId: string) => boolean>()).copySelected();

    expect(announce.mock.calls).toStrictEqual([["Could not copy block"]]);
    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content).toStrictEqual([
      createTextNode(TEST_ROOT_TEXT_ID),
    ]);
  });
});
