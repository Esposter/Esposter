// @vitest-environment nuxt
import PageBuilderLayers from "@/components/PageBuilder/Layers.vue";
import { press } from "@/components/Ui/press.test";
import { TEST_NESTED_TEXT_ID, TEST_SECTION_ID, TEST_WEBPAGE } from "@/services/pageBuilder/constants.test";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { assert, describe, expect, test } from "vitest";

describe("pageBuilderLayers", () => {
  test("arrow keys walk the layers tree and select the focused node", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    usePageBuilderDocumentStore().setDocument(resourceId, TEST_WEBPAGE);
    const component = await mountSuspended(PageBuilderLayers, { attachTo: document.body, props: { resourceId } });
    component.get(`[data-item-id="${TEST_SECTION_ID}"]`).element.focus();

    await expect(press("ArrowDown")).resolves.toBe(TEST_NESTED_TEXT_ID);
    expect(usePageBuilderCanvasStore().getSelectedNodeId(resourceId)).toBe(TEST_NESTED_TEXT_ID);

    component.unmount();
  });

  test("typing a label in the tree moves focus to that node", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    usePageBuilderDocumentStore().setDocument(resourceId, TEST_WEBPAGE);
    const component = await mountSuspended(PageBuilderLayers, { attachTo: document.body, props: { resourceId } });
    component.get(`[data-item-id="${TEST_SECTION_ID}"]`).element.focus();

    await press("t");

    await expect(press("e")).resolves.toBe(TEST_NESTED_TEXT_ID);

    component.unmount();
  });
});
