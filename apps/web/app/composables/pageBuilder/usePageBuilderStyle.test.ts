import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";

import { ButtonTarget } from "#shared/models/pageBuilder/ButtonTarget";
import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL, TEST_OTHER_ID, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { createButton } from "#shared/services/pageBuilder/createButton.test";
import { usePageBuilderStyle } from "#src/composables/pageBuilder/usePageBuilderStyle";
import { webpageKind } from "#src/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "#src/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "#src/store/pageBuilder/history";
import { createPinia, setActivePinia } from "pinia";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";

describe(usePageBuilderStyle, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("paste style applies copied styles to another node", () => {
    expect.hasAssertions();

    const resourceId = v7();
    const style: NodeStyle = { [StyleBreakpoint.Base]: { [StyleState.Default]: { color: "red" } } };
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument, setDocument } = pageBuilderDocumentStore;
    setDocument(resourceId, webpageKind, {
      content: [
        {
          props: { elementId: "", href: TEST_URL, id: TEST_ID, label: TEST_LABEL, style, target: ButtonTarget.SameTab },
          type: WebpageNodeType.Button,
        },
        createButton(TEST_OTHER_ID),
      ],
      root: TEST_ROOT,
    });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const { setSelectedNodeId } = pageBuilderCanvasStore;
    setSelectedNodeId(resourceId, TEST_ID);
    usePageBuilderStyle(resourceId).copyStyle();
    setSelectedNodeId(resourceId, TEST_OTHER_ID);
    usePageBuilderStyle(resourceId).pasteStyle();

    expect(getDocument(resourceId)?.content[1]?.props.style).toStrictEqual(style);
  });

  test("resetting a node's last override removes its style", () => {
    expect.hasAssertions();

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument, setDocument } = pageBuilderDocumentStore;
    setDocument(resourceId, webpageKind, { content: [createButton(TEST_ID)], root: TEST_ROOT });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const { setSelectedNodeId } = pageBuilderCanvasStore;
    setSelectedNodeId(resourceId, TEST_ID);
    const { resetField, setField } = usePageBuilderStyle(resourceId);

    setField("color", "red");
    resetField("color");

    expect(getDocument(resourceId)?.content[0]?.props).toStrictEqual({
      elementId: "",
      href: TEST_URL,
      id: TEST_ID,
      label: TEST_LABEL,
      target: ButtonTarget.SameTab,
    });
  });

  test("a blank field value resets the node's style as an empty one does", () => {
    expect.hasAssertions();

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument, setDocument } = pageBuilderDocumentStore;
    setDocument(resourceId, webpageKind, { content: [createButton(TEST_ID)], root: TEST_ROOT });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const { setSelectedNodeId } = pageBuilderCanvasStore;
    setSelectedNodeId(resourceId, TEST_ID);
    const { setField } = usePageBuilderStyle(resourceId);

    setField("color", "red");
    setField("color", " ");

    expect(getDocument(resourceId)?.content[0]?.props).toStrictEqual({
      elementId: "",
      href: TEST_URL,
      id: TEST_ID,
      label: TEST_LABEL,
      target: ButtonTarget.SameTab,
    });
  });

  test("resetting a property a node does not set records no edit", () => {
    expect.hasAssertions();

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { setDocument } = pageBuilderDocumentStore;
    setDocument(resourceId, webpageKind, { content: [createButton(TEST_ID)], root: TEST_ROOT });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const { setSelectedNodeId } = pageBuilderCanvasStore;
    setSelectedNodeId(resourceId, TEST_ID);
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { getUndoLabel } = pageBuilderHistoryStore;

    usePageBuilderStyle(resourceId).resetField("color");

    expect(getUndoLabel(resourceId)).toBe("");
  });

  test("dragging an opacity slider records one undoable change", () => {
    expect.hasAssertions();

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { setDocument } = pageBuilderDocumentStore;
    setDocument(resourceId, webpageKind, { content: [createButton(TEST_ID)], root: TEST_ROOT });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const { setSelectedNodeId } = pageBuilderCanvasStore;
    setSelectedNodeId(resourceId, TEST_ID);
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { getPreview, getUndoLabel, undo } = pageBuilderHistoryStore;
    const { previewField, setField } = usePageBuilderStyle(resourceId);

    previewField("opacity", "0.5");
    previewField("opacity", "0.4");

    expect(getUndoLabel(resourceId)).toBe("");
    expect(getPreview(resourceId)?.content[0]?.props.style).toStrictEqual({
      [StyleBreakpoint.Base]: { [StyleState.Default]: { opacity: "0.4" } },
    });

    setField("opacity", "0.4");

    expect(getUndoLabel(resourceId)).toBe("Edit style");
    expect(getPreview(resourceId)).toBeUndefined();
    undo(resourceId);

    expect(getUndoLabel(resourceId)).toBe("");
  });

  test("a style edit writes the breakpoint of the device the canvas shows", () => {
    expect.hasAssertions();

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument, setDocument } = pageBuilderDocumentStore;
    setDocument(resourceId, webpageKind, { content: [createButton(TEST_ID)], root: TEST_ROOT });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const { setDevice, setSelectedNodeId } = pageBuilderCanvasStore;
    setSelectedNodeId(resourceId, TEST_ID);
    setDevice(resourceId, PageBuilderDevice.Tablet);

    usePageBuilderStyle(resourceId).setField("color", "red");

    expect(getDocument(resourceId)?.content[0]?.props.style).toStrictEqual({
      [StyleBreakpoint.Tablet]: { [StyleState.Default]: { color: "red" } },
    });
  });
});
