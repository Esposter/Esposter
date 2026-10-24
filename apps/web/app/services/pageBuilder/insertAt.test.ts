// @vitest-environment nuxt
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ROOT_TEXT_ID, TEST_SECTION_ID, TEST_WEBPAGE } from "@/services/pageBuilder/constants.test";
import { insertAt } from "@/services/pageBuilder/insertAt";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { createPinia, setActivePinia } from "pinia";
import { describe, expect, test, vi } from "vitest";
import { webpageKind } from "@/services/pageBuilder/webpageKind";

describe(insertAt, () => {
  // The id the insert gives its new node is fixed, so a test reads it exactly
  const setup = () => {
    setActivePinia(createPinia());
    const resourceId = crypto.randomUUID();
    usePageBuilderDocumentStore().setDocument(resourceId, webpageKind, TEST_WEBPAGE);
    const insertedId = crypto.randomUUID();
    vi.spyOn(crypto, "randomUUID").mockReturnValueOnce(insertedId);
    return { insertedId, resourceId };
  };

  test("an insert places the new node at the index of the slot and selects it", () => {
    expect.hasAssertions();

    const { insertedId, resourceId } = setup();

    expect(insertAt(resourceId, "/content", 1, WebpageNodeType.Text)).toBe(true);
    expect(
      usePageBuilderDocumentStore()
        .getDocument(resourceId)
        ?.content.map(({ props }) => props.id),
    ).toStrictEqual([TEST_SECTION_ID, insertedId, TEST_ROOT_TEXT_ID]);
    expect(usePageBuilderCanvasStore().getSelectedNodeId(resourceId)).toBe(insertedId);
  });

  test("a slot that refuses the type applies nothing", () => {
    expect.hasAssertions();

    const { resourceId } = setup();
    const before = usePageBuilderDocumentStore().getDocument(resourceId);

    expect(insertAt(resourceId, "/content/0/props/children", 0, WebpageNodeType.Column)).toBe(false);
    expect(usePageBuilderDocumentStore().getDocument(resourceId)).toBe(before);
  });
});
