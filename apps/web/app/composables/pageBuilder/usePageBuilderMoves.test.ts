// @vitest-environment nuxt
import type { BlockDocument } from "headless-block-editor";

import { SectionTag } from "#shared/models/pageBuilder/SectionTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { usePageBuilderMoves } from "@/composables/pageBuilder/usePageBuilderMoves";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { createPinia, setActivePinia } from "pinia";
import { describe, expect, test, vi } from "vitest";

const createSection = (id: string, children: BlockDocument["content"]) => ({
  props: { children, id, tag: SectionTag.Section },
  type: WebpageNodeType.Section,
});
const createColumns = (id: string, children: BlockDocument["content"]) => ({
  props: { children, id },
  type: WebpageNodeType.Columns,
});
const createColumn = (id: string, children: BlockDocument["content"]) => ({
  props: { children, id },
  type: WebpageNodeType.Column,
});
const createImage = (id: string) => ({
  props: { alt: "", decorative: true, id, src: "https://example.com/a.png" },
  type: WebpageNodeType.Image,
});

// Section 1 holds Columns with one Column; Section 2 holds an image; the image sits in Section 2
const createFixtureDocument = (): BlockDocument => ({
  content: [
    createSection("s1", [createColumns("cs", [createColumn("k1", [])])]),
    createSection("s2", [createImage("i1")]),
  ],
  root: TEST_ROOT,
});

const setup = async (selectedNodeId: string, document = createFixtureDocument()) => {
  setActivePinia(createPinia());
  const resourceId = crypto.randomUUID();
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { loadDocument } = pageBuilderDocumentStore;
  await loadDocument(resourceId, () => Promise.resolve(document));
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  pageBuilderCanvasStore.setSelectedNodeId(resourceId, selectedNodeId);
  const announce = vi.fn<(message: string) => void>();
  return {
    announce,
    pageBuilderCanvasStore,
    pageBuilderDocumentStore,
    resourceId,
    ...usePageBuilderMoves(resourceId, announce),
  };
};

describe(usePageBuilderMoves, () => {
  test("alt Down moves the selected node after its next sibling", async () => {
    expect.hasAssertions();

    const { moveDown, resourceId, pageBuilderDocumentStore } = await setup("s1");
    moveDown();

    expect(pageBuilderDocumentStore.getDocument(resourceId)).toStrictEqual({
      content: [
        createSection("s2", [createImage("i1")]),
        createSection("s1", [createColumns("cs", [createColumn("k1", [])])]),
      ],
      root: TEST_ROOT,
    });
  });

  test("alt Right moves a node into the previous sibling", async () => {
    expect.hasAssertions();

    const { moveRight, resourceId, pageBuilderDocumentStore } = await setup("s2");
    moveRight();

    expect(pageBuilderDocumentStore.getDocument(resourceId)).toStrictEqual({
      content: [
        createSection("s1", [createColumns("cs", [createColumn("k1", [])]), createSection("s2", [createImage("i1")])]),
      ],
      root: TEST_ROOT,
    });
  });

  test("alt Left moves a node out after its parent", async () => {
    expect.hasAssertions();

    const { moveLeft, resourceId, pageBuilderDocumentStore } = await setup("i1");
    moveLeft();

    expect(pageBuilderDocumentStore.getDocument(resourceId)).toStrictEqual({
      content: [
        createSection("s1", [createColumns("cs", [createColumn("k1", [])])]),
        createSection("s2", []),
        createImage("i1"),
      ],
      root: TEST_ROOT,
    });
  });

  test("move to lists every slot that accepts the node", async () => {
    expect.hasAssertions();

    const { moveToScope } = await setup("i1");

    expect(moveToScope.commands().map(({ title }) => title)).toStrictEqual([
      "The page",
      "Section 1",
      "Section 1 › Columns › Column",
      "Section 2",
    ]);
  });

  test("move to offers no slot that refuses the node", async () => {
    expect.hasAssertions();

    const { moveToScope } = await setup("k1");

    expect(moveToScope.commands().map(({ title }) => title)).toStrictEqual(["Section 1 › Columns"]);
  });

  test("deleting a node moves focus to a neighbour", async () => {
    expect.hasAssertions();

    const { pageBuilderCanvasStore, deleteSelected, pageBuilderDocumentStore, resourceId } = await setup("s1");
    deleteSelected();

    expect(pageBuilderDocumentStore.getDocument(resourceId)).toStrictEqual({
      content: [createSection("s2", [createImage("i1")])],
      root: TEST_ROOT,
    });
    expect(pageBuilderCanvasStore.getSelectedNodeId(resourceId)).toBe("s2");
  });

  test("a move announces the node's new position among its siblings", async () => {
    expect.hasAssertions();

    const { announce, moveDown } = await setup("s1");
    moveDown();

    expect(announce.mock.calls).toStrictEqual([["Moved Section 2 to position 2 of 2 in The page"]]);
  });

  test("a move announces a sibling of the same type by its ordinal, as the path names it", async () => {
    expect.hasAssertions();

    const { announce, moveDown } = await setup("k1", {
      content: [createSection("s1", [createColumns("cs", [createColumn("k1", []), createColumn("k2", [])])])],
      root: TEST_ROOT,
    });
    moveDown();

    expect(announce.mock.calls).toStrictEqual([["Moved Column 2 to position 2 of 2 in Section › Columns"]]);
  });

  test("a move to another slot announces the slot it landed in", async () => {
    expect.hasAssertions();

    const { announce, moveTo } = await setup("i1");
    moveTo("/content/0/props/children");

    expect(announce.mock.calls).toStrictEqual([["Moved Image to position 2 of 2 in Section 1"]]);
  });

  test("a delete announces what was deleted", async () => {
    expect.hasAssertions();

    const { announce, deleteSelected } = await setup("s1");
    deleteSelected();

    expect(announce.mock.calls).toStrictEqual([["Deleted Section 1"]]);
  });

  test("a refused move announces nothing", async () => {
    expect.hasAssertions();

    const { announce, moveUp, pageBuilderDocumentStore, resourceId } = await setup("s1");
    const before = pageBuilderDocumentStore.getDocument(resourceId);
    moveUp();

    expect(pageBuilderDocumentStore.getDocument(resourceId)).toBe(before);
    expect(announce.mock.calls).toStrictEqual([]);
  });
});
