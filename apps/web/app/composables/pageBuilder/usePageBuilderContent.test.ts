import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { usePageBuilderContent } from "@/composables/pageBuilder/usePageBuilderContent";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(usePageBuilderContent, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("a field change is one history entry per node", () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [{ props: { href: TEST_URL, id: TEST_ID, label: TEST_LABEL }, type: WebpageNodeType.Button }],
      root: TEST_ROOT,
    });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const { setFormValue } = usePageBuilderContent(
      webpageKind,
      () => pageBuilderDocumentStore.getDocument(resourceId),
      resourceId,
    );
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();

    setFormValue({ href: TEST_URL, label: "O" });
    setFormValue({ href: TEST_URL, label: "Op" });

    expect(pageBuilderHistoryStore.historyMap.get(resourceId)?.past).toHaveLength(1);
  });
});
