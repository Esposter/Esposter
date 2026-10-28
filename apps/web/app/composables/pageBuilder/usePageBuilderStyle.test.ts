import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";

import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL, TEST_OTHER_ID, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { createButton } from "#shared/services/pageBuilder/createButton.test";
import { usePageBuilderStyle } from "@/composables/pageBuilder/usePageBuilderStyle";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
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
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [
        { props: { href: TEST_URL, id: TEST_ID, label: TEST_LABEL, style }, type: WebpageNodeType.Button },
        createButton(TEST_OTHER_ID),
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

  test("resetting a node's last override removes its style", () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [createButton(TEST_ID)],
      root: TEST_ROOT,
    });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const { resetField, setField } = usePageBuilderStyle(resourceId);

    setField("color", "red");
    resetField("color");

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content[0]?.props).toStrictEqual({
      href: TEST_URL,
      id: TEST_ID,
      label: TEST_LABEL,
    });
  });

  test("resetting a property a node does not set records no edit", () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [createButton(TEST_ID)],
      root: TEST_ROOT,
    });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();

    usePageBuilderStyle(resourceId).resetField("color");

    expect(pageBuilderHistoryStore.historyMap.get(resourceId)).toBeUndefined();
  });

  test("dragging an opacity slider records one undoable change", () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [createButton(TEST_ID)],
      root: TEST_ROOT,
    });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { previewField, setField } = usePageBuilderStyle(resourceId);

    previewField("opacity", "0.5");
    previewField("opacity", "0.4");

    expect(pageBuilderHistoryStore.historyMap.get(resourceId)?.past.length ?? 0).toBe(0);
    expect(pageBuilderHistoryStore.getPreview(resourceId)?.content[0]?.props.style).toStrictEqual({
      [StyleBreakpoint.Base]: { [StyleState.Default]: { opacity: "0.4" } },
    });

    setField("opacity", "0.4");

    expect(pageBuilderHistoryStore.historyMap.get(resourceId)?.past).toHaveLength(1);
    expect(pageBuilderHistoryStore.getPreview(resourceId)).toBeUndefined();
  });
});
