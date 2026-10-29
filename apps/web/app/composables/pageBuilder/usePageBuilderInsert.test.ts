// @vitest-environment nuxt
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_OTHER_ID, TEST_ROOT, TEST_THIRD_ID } from "#shared/services/pageBuilder/constants.test";
import { createButton } from "#shared/services/pageBuilder/createButton.test";
import { usePageBuilderInsert } from "@/composables/pageBuilder/usePageBuilderInsert";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { createWebpageNode } from "@/services/pageBuilder/webpageNodeDefaults";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, describe, expect, test, vi } from "vitest";

const setup = (selectedNodeId: string, content: WebpageDocument["content"]) => {
  setActivePinia(createPinia());
  const resourceId = crypto.randomUUID();
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  pageBuilderDocumentStore.setDocument(resourceId, webpageKind, { content, root: TEST_ROOT });
  pageBuilderCanvasStore.setSelectedNodeId(resourceId, selectedNodeId);
  const announce = vi.fn<(message: string) => void>();
  const { insert } = usePageBuilderInsert(
    webpageKind,
    () => pageBuilderDocumentStore.getDocument(resourceId),
    resourceId,
    announce,
  );
  // The id the insert gives its new node, fixed so a test reads it exactly
  const insertedId = crypto.randomUUID();
  vi.spyOn(crypto, "randomUUID").mockReturnValueOnce(insertedId);
  return { announce, insert, insertedId, pageBuilderCanvasStore, pageBuilderDocumentStore, resourceId };
};

describe("usePageBuilderInsert", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("an insert places the new node after the selected node", () => {
    expect.hasAssertions();

    const { insert, insertedId, pageBuilderCanvasStore, pageBuilderDocumentStore, resourceId } = setup(TEST_ID, [
      createButton(TEST_ID),
      createButton(TEST_OTHER_ID),
    ]);

    insert(WebpageNodeType.Text);

    const content = pageBuilderDocumentStore.getDocument(resourceId)?.content ?? [];

    expect(content.map(({ props, type }) => [props.id, type])).toStrictEqual([
      [TEST_ID, WebpageNodeType.Button],
      [insertedId, WebpageNodeType.Text],
      [TEST_OTHER_ID, WebpageNodeType.Button],
    ]);
    expect(pageBuilderCanvasStore.getSelectedNodeId(resourceId)).toBe(insertedId);
  });

  test("an insert into an empty container fills its first slot", () => {
    expect.hasAssertions();

    const { insert, insertedId, pageBuilderDocumentStore, resourceId } = setup(TEST_ID, [
      { props: { children: [], id: TEST_ID, tag: HtmlTag.Section }, type: WebpageNodeType.Section },
    ]);

    insert(WebpageNodeType.Button);

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content).toStrictEqual([
      {
        props: { children: [createWebpageNode(WebpageNodeType.Button, insertedId)], id: TEST_ID, tag: HtmlTag.Section },
        type: WebpageNodeType.Section,
      },
    ]);
  });

  test("an insert the slot refuses does nothing", () => {
    expect.hasAssertions();

    const { announce, insert, pageBuilderDocumentStore, resourceId } = setup(TEST_ID, [
      {
        props: {
          children: [{ props: { children: [createButton(TEST_OTHER_ID)], id: TEST_ID }, type: WebpageNodeType.Column }],
          id: TEST_THIRD_ID,
        },
        type: WebpageNodeType.Columns,
      },
    ]);
    const documentBefore = pageBuilderDocumentStore.getDocument(resourceId);

    insert(WebpageNodeType.Text);

    expect(pageBuilderDocumentStore.getDocument(resourceId)).toBe(documentBefore);
    expect(announce).not.toHaveBeenCalled();
  });

  test("an insert announces the block it added", () => {
    expect.hasAssertions();

    const { announce, insert } = setup(TEST_ID, [createButton(TEST_ID)]);

    insert(WebpageNodeType.Image);

    expect(announce.mock.calls).toStrictEqual([["Inserted Image"]]);
  });
});
