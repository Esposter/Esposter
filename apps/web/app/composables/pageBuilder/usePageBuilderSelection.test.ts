// @vitest-environment nuxt
import { usePageBuilderSelection } from "@/composables/pageBuilder/usePageBuilderSelection";
import {
  TEST_NESTED_TEXT_ID,
  TEST_ROOT_TEXT_ID,
  TEST_SECTION_ID,
  TEST_WEBPAGE,
} from "@/services/pageBuilder/constants.test";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { createPinia, setActivePinia } from "pinia";
import { describe, expect, test } from "vitest";

// The document is the webpage fixture: a section holding a text node, then a text node at the root
const setup = (selectedNodeId: string) => {
  setActivePinia(createPinia());
  const resourceId = crypto.randomUUID();
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  pageBuilderDocumentStore.setDocument(resourceId, webpageKind, TEST_WEBPAGE);
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  pageBuilderCanvasStore.setSelectedNodeId(resourceId, selectedNodeId);
  const selection = usePageBuilderSelection(
    webpageKind,
    () => pageBuilderDocumentStore.getDocument(resourceId),
    resourceId,
  );
  const getSelectedNodeId = () => pageBuilderCanvasStore.getSelectedNodeId(resourceId);
  return { ...selection, getSelectedNodeId };
};

describe(usePageBuilderSelection, () => {
  test("next selects the node after the selected one in document order", () => {
    expect.hasAssertions();

    const { getSelectedNodeId, selectAdjacentNode } = setup(TEST_SECTION_ID);

    selectAdjacentNode(1);

    expect(getSelectedNodeId()).toBe(TEST_NESTED_TEXT_ID);
  });

  test("next stays on the last node of the page", () => {
    expect.hasAssertions();

    const { getSelectedNodeId, selectAdjacentNode } = setup(TEST_ROOT_TEXT_ID);

    selectAdjacentNode(1);

    expect(getSelectedNodeId()).toBe(TEST_ROOT_TEXT_ID);
  });

  test("with no node selected, next selects the first node of the page", () => {
    expect.hasAssertions();

    const { getSelectedNodeId, selectAdjacentNode } = setup("");

    selectAdjacentNode(1);

    expect(getSelectedNodeId()).toBe(TEST_SECTION_ID);
  });

  test("escape selects the parent of a nested node", () => {
    expect.hasAssertions();

    const { getSelectedNodeId, selectParent } = setup(TEST_NESTED_TEXT_ID);

    selectParent();

    expect(getSelectedNodeId()).toBe(TEST_SECTION_ID);
  });

  test("escape clears the selection on a node at the root", () => {
    expect.hasAssertions();

    const { getSelectedNodeId, selectParent } = setup(TEST_SECTION_ID);

    selectParent();

    expect(getSelectedNodeId()).toBe("");
  });
});
