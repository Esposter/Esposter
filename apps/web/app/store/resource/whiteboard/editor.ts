import type { CanvasRect } from "@/models/whiteboard/CanvasRect";
import type { Viewport } from "@/models/whiteboard/Viewport";
import type { WhiteboardGesture } from "@/models/whiteboard/WhiteboardGesture";
import type { Bounds, Point, PositionedDocument } from "headless-block-editor";

import { GestureTool } from "@/models/whiteboard/GestureTool";
import { getWorldPoint } from "@/services/whiteboard/gesture/getWorldPoint";
import { getFitViewport } from "@/services/whiteboard/viewport/getFitViewport";
import { getZoomedViewport } from "@/services/whiteboard/viewport/getZoomedViewport";
import { ShapeKind } from "headless-block-editor";

// The view of an open whiteboard: where its canvas sits on the page, what is selected, the tool and the shape a shape tool places, whether
// the tool stays in hand after a placement, the viewport, and the gesture in progress with the document it would leave. None of it is saved
export const useWhiteboardEditorStore = defineStore("resource/whiteboard/editor", () => {
  const canvasRect = ref<CanvasRect>({ height: 0, width: 0, x: 0, y: 0 });
  const gesture = shallowRef<WhiteboardGesture>();
  const isSnapEnabled = ref(true);
  const isToolLocked = ref(false);
  const preview = shallowRef<PositionedDocument>();
  const selectedIds = ref<string[]>([]);
  const shapeKind = ref(ShapeKind.Rectangle);
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
  const toggleSnap = () => {
    isSnapEnabled.value = !isSnapEnabled.value;
  };
  const toggleToolLock = () => {
    isToolLocked.value = !isToolLocked.value;
  };
  const zoomBy = (factor: number) => {
    viewport.value = getZoomedViewport(viewport.value, factor, getCentreScreen());
  };
  const fitTo = (bounds: Bounds) => {
    viewport.value = getFitViewport(bounds, canvasRect.value);
  };
  return {
    canvasRect,
    fitTo,
    gesture,
    getCentrePoint,
    isSnapEnabled,
    isToolLocked,
    preview,
    selectedIds,
    selectElement,
    setCanvasRect,
    shapeKind,
    toggleSnap,
    toggleToolLock,
    tool,
    viewport,
    zoomBy,
  };
});
