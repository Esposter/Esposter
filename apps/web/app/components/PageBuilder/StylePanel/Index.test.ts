// @vitest-environment nuxt
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import PageBuilderStylePanel from "@/components/PageBuilder/StylePanel/Index.vue";
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
    pageBuilderDocumentStore.setDocument(resourceId, {
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
});
