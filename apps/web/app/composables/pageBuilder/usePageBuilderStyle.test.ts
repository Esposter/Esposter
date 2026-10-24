import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";

import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL, TEST_OTHER_ID, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { usePageBuilderStyle } from "@/composables/pageBuilder/usePageBuilderStyle";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(usePageBuilderStyle, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("paste style applies copied styles to another node", () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const style: NodeStyle = { [StyleBreakpoint.Base]: { [StyleState.Default]: { color: "red" } } };
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, {
      content: [
        { props: { href: TEST_URL, id: TEST_ID, label: TEST_LABEL, style }, type: WebpageNodeType.Button },
        { props: { href: TEST_URL, id: TEST_OTHER_ID, label: TEST_LABEL }, type: WebpageNodeType.Button },
      ],
      root: TEST_ROOT,
    });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    usePageBuilderStyle(resourceId).copyStyle();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_OTHER_ID);
    usePageBuilderStyle(resourceId).pasteStyle();

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content[1]?.props.style).toStrictEqual(style);
  });
});
