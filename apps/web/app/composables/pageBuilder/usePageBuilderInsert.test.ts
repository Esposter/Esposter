// @vitest-environment nuxt
import type { BlockDocument } from "headless-block-editor";

import { SectionTag } from "#shared/models/pageBuilder/SectionTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_OTHER_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { createButton } from "#shared/services/pageBuilder/createButton.test";
import { usePageBuilderInsert } from "@/composables/pageBuilder/usePageBuilderInsert";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { createPinia, setActivePinia } from "pinia";
import { describe, expect, test, vi } from "vitest";

const setup = (selectedNodeId: string, content: BlockDocument["content"]) => {
  setActivePinia(createPinia());
  const resourceId = crypto.randomUUID();
  usePageBuilderDocumentStore().setDocument(resourceId, { content, root: TEST_ROOT });
  usePageBuilderCanvasStore().setSelectedNodeId(resourceId, selectedNodeId);
  const announce = vi.fn<(message: string) => void>();
  const { insert } = usePageBuilderInsert(resourceId, announce);
  return { announce, insert, resourceId };
};

describe("usePageBuilderInsert", () => {
  test("an insert places the new node after the selected node", () => {
    expect.hasAssertions();

    const { insert, resourceId } = setup(TEST_ID, [createButton(TEST_ID), createButton(TEST_OTHER_ID)]);

    insert(WebpageNodeType.Text);

    const content = usePageBuilderDocumentStore().getDocument(resourceId)?.content ?? [];
    expect(content.map(({ props, type }) => [props.id, type])).toStrictEqual([
      [TEST_ID, WebpageNodeType.Button],
      [expect.any(String), WebpageNodeType.Text],
      [TEST_OTHER_ID, WebpageNodeType.Button],
    ]);
    expect(usePageBuilderCanvasStore().getSelectedNodeId(resourceId)).toBe(content.at(1)?.props.id);
  });

  test("an insert into an empty container fills its first slot", () => {
    expect.hasAssertions();

    const { insert, resourceId } = setup(TEST_ID, [
      { props: { children: [], id: TEST_ID, tag: SectionTag.Section }, type: WebpageNodeType.Section },
    ]);

    insert(WebpageNodeType.Button);

    expect(usePageBuilderDocumentStore().getDocument(resourceId)?.content).toStrictEqual([
      {
        props: {
          children: [{ props: expect.any(Object), type: WebpageNodeType.Button }],
          id: TEST_ID,
          tag: SectionTag.Section,
        },
        type: WebpageNodeType.Section,
      },
    ]);
  });

  test("an insert the slot refuses does nothing", () => {
    expect.hasAssertions();

    const { announce, insert, resourceId } = setup(TEST_ID, [
      {
        props: {
          children: [{ props: { children: [createButton(TEST_OTHER_ID)], id: TEST_ID }, type: WebpageNodeType.Column }],
          id: "columns",
        },
        type: WebpageNodeType.Columns,
      },
    ]);
    const documentBefore = usePageBuilderDocumentStore().getDocument(resourceId);

    insert(WebpageNodeType.Text);

    expect(usePageBuilderDocumentStore().getDocument(resourceId)).toBe(documentBefore);
    expect(announce).not.toHaveBeenCalled();
  });

  test("an insert announces the block it added", () => {
    expect.hasAssertions();

    const { announce, insert } = setup(TEST_ID, [createButton(TEST_ID)]);

    insert(WebpageNodeType.Image);

    expect(announce.mock.calls).toStrictEqual([["Inserted Image"]]);
  });
});
