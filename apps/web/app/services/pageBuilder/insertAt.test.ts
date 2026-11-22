import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ROOT_TEXT_ID, TEST_SECTION_ID, TEST_WEBPAGE } from "#src/services/pageBuilder/constants.test";
import { insertAt } from "#src/services/pageBuilder/insertAt";
import { webpageKind } from "#src/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "#src/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";
import { createPinia, setActivePinia } from "pinia";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("uuid"), async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, v7: vi.fn<() => string>(actual.v7) };
});

// Inserts into the document the store holds for the resource, the way the shell does
const insertIntoResource = (resourceId: string, slotPointer: string, index: number, type: WebpageNodeType) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getDocument } = pageBuilderDocumentStore;
  const document = getDocument(resourceId);
  return (
    document !== undefined &&
    insertAt(webpageKind, document, resourceId, slotPointer, index, (id) => webpageKind.createNode(type, id))
  );
};

const setup = () => {
  setActivePinia(createPinia());
  const resourceId = v7();
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { setDocument } = pageBuilderDocumentStore;
  setDocument(resourceId, webpageKind, TEST_WEBPAGE);
  return resourceId;
};

describe(insertAt, () => {
  test("an insert places the new node at the index of the slot and selects it", () => {
    expect.hasAssertions();

    const resourceId = setup();
    // The id the insert gives its new node is fixed, so the test reads it exactly. Queued here, the one test that
    // Consumes it, so no other case inherits an unused once-value
    const insertedId = v7();
    vi.mocked<() => string>(v7).mockReturnValueOnce(insertedId);
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const { getSelectedNodeId } = pageBuilderCanvasStore;

    expect(insertIntoResource(resourceId, "/content", 1, WebpageNodeType.Text)).toBe(true);
    expect(getDocument(resourceId)?.content.map(({ props }) => props.id)).toStrictEqual([
      TEST_SECTION_ID,
      insertedId,
      TEST_ROOT_TEXT_ID,
    ]);
    expect(getSelectedNodeId(resourceId)).toBe(insertedId);
  });

  test("a slot that refuses the type applies nothing", () => {
    expect.hasAssertions();

    const resourceId = setup();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const before = getDocument(resourceId);

    expect(insertIntoResource(resourceId, "/content/0/props/children", 0, WebpageNodeType.Column)).toBe(false);
    expect(getDocument(resourceId)).toBe(before);
  });
});
