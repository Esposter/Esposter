import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { SurveyDropSlot } from "@/models/resource/survey/SurveyDropSlot";
import type { SurveyNodeType } from "headless-survey-engine";

// The drag a creator pane starts from the palette or the canvas. The palette starts it and the canvas draws it, so the drag
// is held here rather than in either pane. The composable owns the press that starts it and the release that lands it
export const useSurveyCreatorDragStore = defineStore("survey/creatorDrag", () => {
  const draggedType = shallowRef<SurveyNodeType>();
  // The id of the node being moved, or "" for a kind the palette inserts
  const draggedNodeId = ref("");
  const dragPoint = shallowRef({ x: 0, y: 0 });
  const dropTarget = shallowRef<DropTarget>();
  const isDragging = computed(() => draggedType.value !== undefined);
  // The canvas's measuring of its slots. It is a plain function rather than state, since only a drag reads it, and a canvas
  // holds it only while it is mounted
  let measureCanvasSlots: (() => SurveyDropSlot[]) | undefined;
  const setDrag = (type: SurveyNodeType, nodeId: string) => {
    draggedType.value = type;
    draggedNodeId.value = nodeId;
  };
  const moveDrag = (point: { x: number; y: number }, target: DropTarget | undefined) => {
    dragPoint.value = point;
    dropTarget.value = target;
  };
  const clearDrag = () => {
    draggedType.value = undefined;
    draggedNodeId.value = "";
    dropTarget.value = undefined;
  };
  const setSlotMeasurer = (measure: () => SurveyDropSlot[]) => {
    measureCanvasSlots = measure;
  };
  // A canvas that unmounts takes its measuring away, unless a canvas mounted since has replaced it
  const clearSlotMeasurer = (measure: () => SurveyDropSlot[]) => {
    if (measureCanvasSlots === measure) measureCanvasSlots = undefined;
  };
  const measureSlots = () => measureCanvasSlots?.() ?? [];

  return {
    clearDrag,
    clearSlotMeasurer,
    dragPoint,
    draggedNodeId,
    draggedType,
    dropTarget,
    isDragging,
    measureSlots,
    moveDrag,
    setDrag,
    setSlotMeasurer,
  };
});
