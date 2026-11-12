import type { CanvasRect } from "@/models/whiteboard/CanvasRect";
import type { Viewport } from "@/models/whiteboard/Viewport";
import type { WhiteboardGesture } from "@/models/whiteboard/WhiteboardGesture";
import type { Bounds, Point, PositionedDocument, PositionedElement } from "vue-block-editor-headless";

import { GestureTool } from "@/models/whiteboard/GestureTool";
import { getWorldPoint } from "@/services/whiteboard/gesture/getWorldPoint";
import { getFitViewport } from "@/services/whiteboard/viewport/getFitViewport";
import { getZoomedViewport } from "@/services/whiteboard/viewport/getZoomedViewport";
import { getExportBounds, ShapeKind } from "vue-block-editor-headless";

// The view of an open whiteboard: where its canvas sits on the page, what is selected, the tool and the shape a shape tool places, and the viewport.
// It also holds whether the tool stays in hand after a placement, the gesture in progress with the document it would leave, and the element whose text is
// Being edited in place. None of it is saved
export const useWhiteboardEditorStore = defineStore("resource/whiteboard/editor", () => {
  const canvasRect = ref<CanvasRect>({ height: 0, width: 0, x: 0, y: 0 });
  const gesture = shallowRef<WhiteboardGesture>();
  const isSpaceHeld = ref(false);
  const isToolLocked = ref(false);
  const preview = shallowRef<PositionedDocument>();
  const selectedIds = ref<string[]>([]);
  const shapeKind = ref(ShapeKind.Rectangle);
  const textEditElementId = ref("");
  const tool = ref(GestureTool.Select);
  const viewport = ref<Viewport>({ scale: 1, x: 0, y: 0 });
  const getCentreScreen = (): Point => ({ x: canvasRect.value.width / 2, y: canvasRect.value.height / 2 });
  // The document point at the middle of the canvas, where a picked image is placed
  const getCentrePoint = () => getWorldPoint(getCentreScreen(), viewport.value);
  const setCanvasRect = (rect: CanvasRect) => {
    canvasRect.value = rect;
  };
  const selectElement = (id: string) => {
    selectedIds.value = [id];
  };
  const setTextEditElementId = (id: string) => {
    textEditElementId.value = id;
  };
  const toggleToolLock = () => {
    isToolLocked.value = !isToolLocked.value;
  };
  const zoomTo = (scale: number) => {
    viewport.value = getZoomedViewport(viewport.value, scale, getCentreScreen());
  };
  const zoomBy = (factor: number) => {
    zoomTo(viewport.value.scale * factor);
  };
  const fitTo = (bounds: Bounds) => {
    viewport.value = getFitViewport(bounds, canvasRect.value);
  };
  // A fit of nothing has no bounds to show, so no elements leave the view where it is
  const fitToElements = (elements: PositionedElement[]) => {
    if (elements.length > 0) fitTo(getExportBounds({ elements }));
  };
  return {
    canvasRect,
    fitTo,
    fitToElements,
    gesture,
    getCentrePoint,
    isSpaceHeld,
    isToolLocked,
    preview,
    selectedIds,
    selectElement,
    setCanvasRect,
    setTextEditElementId,
    shapeKind,
    textEditElementId,
    toggleToolLock,
    tool,
    viewport,
    zoomBy,
    zoomTo,
  };
});
