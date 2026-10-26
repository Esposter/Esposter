// @vitest-environment nuxt
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ROOT_TEXT_ID, TEST_SECTION_ID, TEST_WEBPAGE } from "@/services/pageBuilder/constants.test";
import { insertAt } from "@/services/pageBuilder/insertAt";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, describe, expect, test, vi } from "vitest";

// Inserts into the document the store holds for the resource, the way the shell does
const insertIntoResource = (resourceId: string, slotPointer: string, index: number, type: WebpageNodeType) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const document = pageBuilderDocumentStore.getDocument(resourceId);
  return (
    document !== undefined &&
    insertAt(webpageKind, document, resourceId, slotPointer, index, (id) => webpageKind.createNode(type, id))
  );
};

// The id the insert gives its new node is fixed, so a test reads it exactly
const setup = () => {
  setActivePinia(createPinia());
  const resourceId = crypto.randomUUID();
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  pageBuilderDocumentStore.setDocument(resourceId, webpageKind, TEST_WEBPAGE);
  const insertedId = crypto.randomUUID();
  vi.spyOn(crypto, "randomUUID").mockReturnValueOnce(insertedId);
  return { insertedId, resourceId };
};

describe(insertAt, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("an insert places the new node at the index of the slot and selects it", () => {
    expect.hasAssertions();

    const { insertedId, resourceId } = setup();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();

    expect(insertIntoResource(resourceId, "/content", 1, WebpageNodeType.Text)).toBe(true);
    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content.map(({ props }) => props.id)).toStrictEqual([
      TEST_SECTION_ID,
      insertedId,
      TEST_ROOT_TEXT_ID,
    ]);
    expect(pageBuilderCanvasStore.getSelectedNodeId(resourceId)).toBe(insertedId);
  });

  test("a slot that refuses the type applies nothing", () => {
    expect.hasAssertions();

    const { resourceId } = setup();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const before = pageBuilderDocumentStore.getDocument(resourceId);

    expect(insertIntoResource(resourceId, "/content/0/props/children", 0, WebpageNodeType.Column)).toBe(false);
    expect(pageBuilderDocumentStore.getDocument(resourceId)).toBe(before);
  });
});
