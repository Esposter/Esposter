// @vitest-environment nuxt
import type { ColumnNode } from "#shared/models/pageBuilder/ColumnNode";
import type { ColumnsNode } from "#shared/models/pageBuilder/ColumnsNode";
import type { ImageNode } from "#shared/models/pageBuilder/ImageNode";
import type { SectionNode } from "#shared/models/pageBuilder/SectionNode";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { WebpagePlaceableNode } from "#shared/models/pageBuilder/WebpagePlaceableNode";

import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { createTestImageNode, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { usePageBuilderMoves } from "@/composables/pageBuilder/usePageBuilderMoves";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { createPinia, setActivePinia } from "pinia";
import { describe, expect, test, vi } from "vitest";

const createSection = (id: string, children: WebpagePlaceableNode[]): SectionNode => ({
  props: { children, id, tag: HtmlTag.Section },
  type: WebpageNodeType.Section,
});
const createColumns = (id: string, children: ColumnNode[]): ColumnsNode => ({
  props: { children, id },
  type: WebpageNodeType.Columns,
});
const createColumn = (id: string, children: WebpagePlaceableNode[]): ColumnNode => ({
  props: { children, id },
  type: WebpageNodeType.Column,
});
const createImage = (id: string): ImageNode => createTestImageNode(TEST_URL, id);

// Section 1 holds Columns with one Column; Section 2 holds an image; the image sits in Section 2
const createFixtureDocument = (): WebpageDocument => ({
  content: [createSection("a", [createColumns("c", [createColumn("d", [])])]), createSection("b", [createImage("f")])],
  root: TEST_ROOT,
});

const setup = (selectedNodeId: string, document = createFixtureDocument()) => {
  setActivePinia(createPinia());
  const resourceId = crypto.randomUUID();
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { setDocument } = pageBuilderDocumentStore;
  setDocument(resourceId, webpageKind, document);
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  pageBuilderCanvasStore.setSelectedNodeId(resourceId, selectedNodeId);
  const announce = vi.fn<(message: string) => void>();
  return {
    announce,
    pageBuilderCanvasStore,
    pageBuilderDocumentStore,
    resourceId,
    ...usePageBuilderMoves(webpageKind, () => pageBuilderDocumentStore.getDocument(resourceId), resourceId, announce),
  };
};

describe(usePageBuilderMoves, () => {
  test("alt Down moves the selected node after its next sibling", () => {
    expect.hasAssertions();

    const { moveDown, pageBuilderDocumentStore, resourceId } = setup("a");
    moveDown();

    expect(pageBuilderDocumentStore.getDocument(resourceId)).toStrictEqual({
      content: [
        createSection("b", [createImage("f")]),
        createSection("a", [createColumns("c", [createColumn("d", [])])]),
      ],
      root: TEST_ROOT,
    });
  });

  test("alt Right moves a node into the previous sibling", () => {
    expect.hasAssertions();

    const { moveRight, pageBuilderDocumentStore, resourceId } = setup("b");
    moveRight();

    expect(pageBuilderDocumentStore.getDocument(resourceId)).toStrictEqual({
      content: [
        createSection("a", [createColumns("c", [createColumn("d", [])]), createSection("b", [createImage("f")])]),
      ],
      root: TEST_ROOT,
    });
  });

  test("alt Left moves a node out after its parent", () => {
    expect.hasAssertions();

    const { moveLeft, pageBuilderDocumentStore, resourceId } = setup("f");
    moveLeft();

    expect(pageBuilderDocumentStore.getDocument(resourceId)).toStrictEqual({
      content: [
        createSection("a", [createColumns("c", [createColumn("d", [])])]),
        createSection("b", []),
        createImage("f"),
      ],
      root: TEST_ROOT,
    });
  });

  test("move to lists every slot that accepts the node", () => {
    expect.hasAssertions();

    const { moveToScope } = setup("f");

    expect(moveToScope.commands().map(({ title }) => title)).toStrictEqual([
      "The page",
      "Section 1",
      "Section 1 › Columns › Column",
      "Section 2",
    ]);
  });

  test("move to offers no slot that refuses the node", () => {
    expect.hasAssertions();

    const { moveToScope } = setup("d");

    expect(moveToScope.commands().map(({ title }) => title)).toStrictEqual(["Section 1 › Columns"]);
  });

  test("deleting a node moves focus to a neighbour", () => {
    expect.hasAssertions();

    const { deleteSelected, pageBuilderCanvasStore, pageBuilderDocumentStore, resourceId } = setup("a");
    deleteSelected();

    expect(pageBuilderDocumentStore.getDocument(resourceId)).toStrictEqual({
      content: [createSection("b", [createImage("f")])],
      root: TEST_ROOT,
    });
    expect(pageBuilderCanvasStore.getSelectedNodeId(resourceId)).toBe("b");
  });

  test("deleting a node ends a text edit on a node inside it", () => {
    expect.hasAssertions();

    const { deleteSelected, pageBuilderCanvasStore, resourceId } = setup("b");
    pageBuilderCanvasStore.setEditingNodeId(resourceId, "f");
    deleteSelected();

    expect(pageBuilderCanvasStore.getEditingNodeId(resourceId)).toBe("");
  });

  test("a move announces the node's new position among its siblings", () => {
    expect.hasAssertions();

    const { announce, moveDown } = setup("a");
    moveDown();

    expect(announce.mock.calls).toStrictEqual([["Moved Section 2 to position 2 of 2 in The page"]]);
  });

  test("a move announces a sibling of the same type by its ordinal, as the path names it", () => {
    expect.hasAssertions();

    const { announce, moveDown } = setup("d", {
      content: [createSection("a", [createColumns("c", [createColumn("d", []), createColumn("e", [])])])],
      root: TEST_ROOT,
    });
    moveDown();

    expect(announce.mock.calls).toStrictEqual([["Moved Column 2 to position 2 of 2 in Section › Columns"]]);
  });

  test("a move to another slot announces the slot it landed in", () => {
    expect.hasAssertions();

    const { announce, moveTo } = setup("f");
    moveTo("/content/0/props/children");

    expect(announce.mock.calls).toStrictEqual([["Moved Image to position 2 of 2 in Section 1"]]);
  });

  test("a delete announces what was deleted", () => {
    expect.hasAssertions();

    const { announce, deleteSelected } = setup("a");
    deleteSelected();

    expect(announce.mock.calls).toStrictEqual([["Deleted Section 1"]]);
  });

  test("a refused move announces nothing", () => {
    expect.hasAssertions();

    const { announce, moveUp, pageBuilderDocumentStore, resourceId } = setup("a");
    const before = pageBuilderDocumentStore.getDocument(resourceId);
    moveUp();

    expect(pageBuilderDocumentStore.getDocument(resourceId)).toBe(before);
    expect(announce.mock.calls).toStrictEqual([]);
  });

  test("duplicating a node places its copy after it", () => {
    expect.hasAssertions();

    const { announce, duplicateSelected, pageBuilderCanvasStore, pageBuilderDocumentStore, resourceId } = setup("f");
    duplicateSelected();
    const copyId = pageBuilderCanvasStore.getSelectedNodeId(resourceId);

    expect(copyId).not.toBe("f");
    expect(pageBuilderDocumentStore.getDocument(resourceId)).toStrictEqual({
      content: [
        createSection("a", [createColumns("c", [createColumn("d", [])])]),
        createSection("b", [createImage("f"), createImage(copyId)]),
      ],
      root: TEST_ROOT,
    });
    expect(announce.mock.calls).toStrictEqual([["Duplicated Image"]]);
  });
});
