// @vitest-environment nuxt
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import {
  createTestImageNode,
  TEST_ID,
  TEST_LABEL,
  TEST_OTHER_ID,
  TEST_ROOT,
  TEST_THIRD_ID,
  TEST_URL,
} from "#shared/services/pageBuilder/constants.test";
import PageBuilderStylePanel from "@/components/PageBuilder/StylePanel/Index.vue";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("pageBuilderStylePanel", () => {
  test("drawing a node whose choices are unset records no edit", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [{ props: { href: TEST_URL, id: TEST_ID, label: TEST_LABEL }, type: WebpageNodeType.Button }],
      root: TEST_ROOT,
    });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();

    const component = await mountSuspended(PageBuilderStylePanel, { props: { resourceId } });

    // A mandatory toggle group may pick its first choice on mount, which an edit would then record against the node
    expect(component.text()).toContain("column");
    expect(pageBuilderHistoryStore.historyMap.get(resourceId)).toBeUndefined();
  });

  test("a refused draft is not shown on the node selected after it", async () => {
    expect.hasAssertions();

    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
      content: [
        createTestImageNode(TEST_URL, TEST_OTHER_ID),
        createTestImageNode(TEST_URL, TEST_THIRD_ID),
      ],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_OTHER_ID);

    const component = await mountSuspended(PageBuilderStylePanel, { props: { resourceId: TEST_ID } });
    const getWidthInput = () => {
      const forId = component
        .findAll("label")
        .find((label) => label.text() === "width")
        ?.attributes("for");
      return component.get(`input[id="${forId}"]`);
    };
    await getWidthInput().setValue("10px}");

    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_THIRD_ID);
    await component.vm.$nextTick();

    expect((getWidthInput().element as HTMLInputElement).value).toBe("");
  });
});
