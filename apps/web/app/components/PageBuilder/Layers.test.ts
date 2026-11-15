// @vitest-environment nuxt
import PageBuilderLayers from "#src/components/PageBuilder/Layers.vue";
import { press } from "#src/components/Ui/press.test";
import { TEST_NESTED_TEXT_ID, TEST_SECTION_ID, TEST_WEBPAGE } from "#src/services/pageBuilder/constants.test";
import { webpageKind } from "#src/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "#src/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("pageBuilderLayers", () => {
  test("arrow keys walk the layers tree and select the focused node", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, TEST_WEBPAGE);
    const component = await mountSuspended(PageBuilderLayers, {
      attachTo: document.body,
      props: { getDocument: () => pageBuilderDocumentStore.getDocument(resourceId), kind: webpageKind, resourceId },
    });
    component.get<HTMLElement>(`[data-item-id="${TEST_SECTION_ID}"]`).element.focus();

    await expect(press("ArrowDown")).resolves.toBe(TEST_NESTED_TEXT_ID);
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();

    expect(pageBuilderCanvasStore.getSelectedNodeId(resourceId)).toBe(TEST_NESTED_TEXT_ID);

    component.unmount();
  });

  test("typing a label in the tree moves focus to that node", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, TEST_WEBPAGE);
    const component = await mountSuspended(PageBuilderLayers, {
      attachTo: document.body,
      props: { getDocument: () => pageBuilderDocumentStore.getDocument(resourceId), kind: webpageKind, resourceId },
    });
    component.get<HTMLElement>(`[data-item-id="${TEST_SECTION_ID}"]`).element.focus();

    await press("t");

    await expect(press("e")).resolves.toBe(TEST_NESTED_TEXT_ID);

    component.unmount();
  });
});
