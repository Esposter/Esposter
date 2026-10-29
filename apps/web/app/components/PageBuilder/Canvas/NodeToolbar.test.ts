// @vitest-environment nuxt
import { createTestImageNode, TEST_ID, TEST_OTHER_ID, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import PageBuilderCanvasNodeToolbar from "@/components/PageBuilder/Canvas/NodeToolbar.vue";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { TEST_NESTED_TEXT_ID, TEST_SECTION_ID, TEST_WEBPAGE } from "@/services/pageBuilder/constants.test";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test, vi } from "vitest";

describe("pageBuilderCanvasNodeToolbar", () => {
  test("the toolbar offers the node's moves", async () => {
    expect.hasAssertions();

    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
      content: [createTestImageNode(TEST_URL, TEST_OTHER_ID)],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_OTHER_ID);

    const component = await mountSuspended(PageBuilderCanvasNodeToolbar, {
      props: {
        announce: vi.fn<(message: string) => void>(),
        kind: webpageKind,
        position: { left: 0, top: 0 },
        resourceId: TEST_ID,
      },
    });

    // The delete's confirm dialog renders inline with the toolbar, so its buttons are left out
    const toolbarButtons = component
      .findAll("button")
      .filter((button) => button.element.closest(".ui-dialog") === null);

    expect(toolbarButtons.map((button) => button.attributes("aria-label"))).toStrictEqual([
      "Select parent",
      "Move up",
      "Move down",
      "Move to…",
      "Duplicate",
      "Delete",
    ]);

    await component.get("button[aria-label='Duplicate']").trigger("click");
    const copyId = pageBuilderCanvasStore.getSelectedNodeId(TEST_ID);

    expect(pageBuilderDocumentStore.getDocument(TEST_ID)?.content).toStrictEqual([
      createTestImageNode(TEST_URL, TEST_OTHER_ID),
      createTestImageNode(TEST_URL, copyId),
    ]);
  });

  test("the toolbar's delete removes the node only once its confirm answers", async () => {
    expect.hasAssertions();

    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
      content: [createTestImageNode(TEST_URL, TEST_OTHER_ID)],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_OTHER_ID);

    const component = await mountSuspended(PageBuilderCanvasNodeToolbar, {
      props: {
        announce: vi.fn<(message: string) => void>(),
        kind: webpageKind,
        position: { left: 0, top: 0 },
        resourceId: TEST_ID,
      },
    });

    await component.get("button[aria-label='Delete']").trigger("click");

    expect(pageBuilderDocumentStore.getDocument(TEST_ID)?.content).toHaveLength(1);

    await component.get(`button[data-variant="${UiButtonVariant.Danger}"]`).trigger("click");

    expect(pageBuilderDocumentStore.getDocument(TEST_ID)?.content).toStrictEqual([]);
  });

  test("the toolbar's select parent selects the node holding the selected one", async () => {
    expect.hasAssertions();

    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, TEST_WEBPAGE);
    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_NESTED_TEXT_ID);

    const component = await mountSuspended(PageBuilderCanvasNodeToolbar, {
      props: {
        announce: vi.fn<(message: string) => void>(),
        kind: webpageKind,
        position: { left: 0, top: 0 },
        resourceId: TEST_ID,
      },
    });

    await component.get("button[aria-label='Select parent']").trigger("click");

    expect(pageBuilderCanvasStore.getSelectedNodeId(TEST_ID)).toBe(TEST_SECTION_ID);
  });
});
