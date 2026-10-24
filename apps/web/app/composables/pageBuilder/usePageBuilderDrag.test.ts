// @vitest-environment nuxt
import type { TextNode } from "#shared/models/pageBuilder/TextNode";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { FrameGeometry } from "@/models/pageBuilder/FrameGeometry";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { usePageBuilderDrag } from "@/composables/pageBuilder/usePageBuilderDrag";
import { WEBPAGE_NODE_TYPE_TITLE_MAP } from "@/services/pageBuilder/constants";
import { TEST_TEXT_CONTENT } from "@/services/pageBuilder/constants.test";
import { getSlotChildIds } from "@/services/pageBuilder/getSlotChildIds";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { createPinia, setActivePinia } from "pinia";
import { describe, expect, test, vi } from "vitest";

const createText = (id: string): TextNode => ({
  props: { content: TEST_TEXT_CONTENT, id },
  type: WebpageNodeType.Text,
});

const pointerAt = (type: string, x: number, y: number) => new PointerEvent(type, { clientX: x, clientY: y });

describe("usePageBuilderDrag", () => {
  const TEXT_ONE = "text-one";
  const TEXT_TWO = "text-two";
  const RECTS: Record<string, { height: number; left: number; top: number; width: number }> = {
    [TEXT_ONE]: { height: 40, left: 0, top: 0, width: 200 },
    [TEXT_TWO]: { height: 40, left: 0, top: 40, width: 200 },
  };
  const RESOURCE_ID = "resource";
  const createGeometry = (hoveredNodeId?: string): FrameGeometry => ({
    checkIsHorizontalOwner: () => false,
    frameRect: { height: 500, left: 0, top: 0, width: 500 },
    getChildRect: (nodeId) => RECTS[nodeId],
    hoveredNodeId,
    scale: 1,
  });
  const setup = (document: WebpageDocument) => {
    setActivePinia(createPinia());
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(RESOURCE_ID, document);
    const announce = vi.fn<(message: string) => void>();
    const { isDragging, startPaletteDrag } = usePageBuilderDrag(RESOURCE_ID, announce);
    return { announce, isDragging, pageBuilderCanvasStore, pageBuilderDocumentStore, startPaletteDrag };
  };

  const COLUMN_SLOT = "/content/0/props/children/0/props/children";
  const COLUMN_DOCUMENT: WebpageDocument = {
    content: [
      {
        props: {
          children: [
            {
              props: { children: [createText(TEXT_ONE), createText(TEXT_TWO)], id: "column" },
              type: WebpageNodeType.Column,
            },
          ],
          id: "columns",
        },
        type: WebpageNodeType.Columns,
      },
    ],
    root: TEST_ROOT,
  };
  const ROOT_DOCUMENT: WebpageDocument = { content: [createText(TEXT_ONE), createText(TEXT_TWO)], root: TEST_ROOT };
  const TEXT_TITLE = WEBPAGE_NODE_TYPE_TITLE_MAP[WebpageNodeType.Text];

  test("escape cancels a drag", () => {
    expect.hasAssertions();
    const { announce, pageBuilderDocumentStore, startPaletteDrag } = setup(COLUMN_DOCUMENT);

    startPaletteDrag(WebpageNodeType.Text, pointerAt("pointerdown", 0, 0), () => createGeometry(TEXT_ONE));
    window.dispatchEvent(pointerAt("pointermove", 100, 30));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    window.dispatchEvent(pointerAt("pointerup", 100, 30));

    expect(pageBuilderDocumentStore.getDocument(RESOURCE_ID)).toStrictEqual(COLUMN_DOCUMENT);
    expect(announce).not.toHaveBeenCalled();
  });

  test("dragging a block into a column inserts it there", () => {
    expect.hasAssertions();
    const { announce, pageBuilderCanvasStore, pageBuilderDocumentStore, startPaletteDrag } = setup(COLUMN_DOCUMENT);

    startPaletteDrag(WebpageNodeType.Text, pointerAt("pointerdown", 0, 0), () => createGeometry(TEXT_ONE));
    window.dispatchEvent(pointerAt("pointermove", 100, 30));
    window.dispatchEvent(pointerAt("pointerup", 100, 30));

    const insertedId = pageBuilderCanvasStore.getSelectedNodeId(RESOURCE_ID);
    const document = pageBuilderDocumentStore.getDocument(RESOURCE_ID);
    expect(document && getSlotChildIds(document, COLUMN_SLOT)).toStrictEqual([TEXT_ONE, insertedId, TEXT_TWO]);
    expect(announce.mock.calls).toStrictEqual([[`Inserted ${TEXT_TITLE}`]]);
  });

  test("dropping a block where no slot accepts it cancels the drop", () => {
    expect.hasAssertions();
    const { announce, pageBuilderDocumentStore, startPaletteDrag } = setup(ROOT_DOCUMENT);

    startPaletteDrag(WebpageNodeType.Column, pointerAt("pointerdown", 0, 0), () => createGeometry(TEXT_ONE));
    window.dispatchEvent(pointerAt("pointermove", 100, 30));
    window.dispatchEvent(pointerAt("pointerup", 100, 30));

    expect(pageBuilderDocumentStore.getDocument(RESOURCE_ID)).toStrictEqual(ROOT_DOCUMENT);
    expect(announce).not.toHaveBeenCalled();
  });

  test("a drag released outside the frame cancels the drop", () => {
    expect.hasAssertions();
    const { announce, pageBuilderDocumentStore, startPaletteDrag } = setup(ROOT_DOCUMENT);

    startPaletteDrag(WebpageNodeType.Text, pointerAt("pointerdown", 0, 0), () => createGeometry());
    window.dispatchEvent(pointerAt("pointermove", 600, 30));
    window.dispatchEvent(pointerAt("pointerup", 600, 30));

    expect(pageBuilderDocumentStore.getDocument(RESOURCE_ID)).toStrictEqual(ROOT_DOCUMENT);
    expect(announce).not.toHaveBeenCalled();
  });

  test("the drag flag is held from the threshold until the release", () => {
    expect.hasAssertions();
    const { isDragging, startPaletteDrag } = setup(ROOT_DOCUMENT);

    startPaletteDrag(WebpageNodeType.Text, pointerAt("pointerdown", 0, 0), () => createGeometry());
    window.dispatchEvent(pointerAt("pointermove", 1, 1));
    expect(isDragging.value).toBe(false);
    window.dispatchEvent(pointerAt("pointermove", 100, 30));
    expect(isDragging.value).toBe(true);
    window.dispatchEvent(pointerAt("pointerup", 100, 30));
    expect(isDragging.value).toBe(false);
  });

  test("a click without movement does not start an insert", () => {
    expect.hasAssertions();
    const { announce, pageBuilderDocumentStore, startPaletteDrag } = setup(ROOT_DOCUMENT);

    startPaletteDrag(WebpageNodeType.Text, pointerAt("pointerdown", 0, 0), () => createGeometry());
    window.dispatchEvent(pointerAt("pointerup", 0, 0));

    expect(pageBuilderDocumentStore.getDocument(RESOURCE_ID)).toStrictEqual(ROOT_DOCUMENT);
    expect(announce).not.toHaveBeenCalled();
  });
});
