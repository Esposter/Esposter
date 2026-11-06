import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { SurveyDropSlot } from "@/models/resource/survey/SurveyDropSlot";
import type { SurveyPlaceableNode } from "vue-survey-engine-headless";

import { useSurveyCreatorCommands } from "@/composables/survey/useSurveyCreatorCommands";
import { createSurveyNode } from "@/services/resource/survey/createSurveyNode";
import { getSurveyNodeLocation } from "@/services/resource/survey/getSurveyNodeLocation";
import { getSurveyNodePointerById } from "@/services/resource/survey/getSurveyNodePointerById";
import { resolveSurveyDropTarget } from "@/services/resource/survey/resolveSurveyDropTarget";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { useSurveyCreatorDragStore } from "@/store/survey/creatorDrag";
import { getBlockNode } from "vue-block-editor-headless";
import { surveyNodeChildren, SurveyNodeType } from "vue-survey-engine-headless";

// The node a drag moves: its pointer, and the slot and index it sits at, which its own slot loses from the boxes a drop reads
interface DragSource {
  index: number;
  nodePointer: string;
  slotPointer: string;
}
// The drag a palette kind or a canvas node starts, shared by every pane through the store, so the canvas draws what the palette
// Starts. A press is a click until it moves the drag distance, or, for a finger, until it rests the touch delay; a finger that
// Moves first is scrolling, so its press ends there. A release over a slot lands the drag as one command, and a release over
// No slot, Escape or a cancel changes nothing
export const useSurveyCreatorDrag = () => {
  const surveyCreatorDragStore = useSurveyCreatorDragStore();
  const { draggedNodeId, draggedType, dragPoint, dropTarget, isDragging } = storeToRefs(surveyCreatorDragStore);
  const { clearDrag, clearSlotMeasurer, measureSlots, moveDrag, setDrag, setSlotMeasurer } = surveyCreatorDragStore;
  const surveyCreatorStore = useSurveyCreatorStore();
  const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
  const { insertNodeAt, moveNodeTo } = useSurveyCreatorCommands();
  const { startPress } = usePressDrag();
  // The slots a drag lands in, read off the canvas as the drag starts, so the preview it draws moves no box a move reads. A node
  // Cannot land inside itself, and its own slot loses the node's box, so the index a drop resolves is the one the core takes once
  // The node is removed
  const getDropSlots = (source?: DragSource): SurveyDropSlot[] => {
    const slots = measureSlots();
    if (source === undefined) return slots;

    return slots
      .filter(({ slotPointer }) => !slotPointer.startsWith(`${source.nodePointer}/`))
      .map((slot) =>
        slot.slotPointer === source.slotPointer
          ? { ...slot, childBoxes: slot.childBoxes.toSpliced(source.index, 1) }
          : slot,
      );
  };
  const trackDrag = (
    event: PointerEvent,
    {
      draggedNodeId: nodeId,
      draggedType: type,
      land,
      source,
    }: { draggedNodeId: string; draggedType: SurveyNodeType; land: (target: DropTarget) => void; source?: DragSource },
  ) => {
    let slots: SurveyDropSlot[] = [];
    const resolveAt = (point: { x: number; y: number }) => resolveSurveyDropTarget({ draggedType: type, point, slots });
    startPress(event, {
      onEnd: clearDrag,
      onMove: (point) => {
        moveDrag(point, resolveAt(point));
      },
      onRelease: (point) => {
        const target = resolveAt(point);
        if (target !== undefined) land(target);
      },
      onStart: () => {
        slots = getDropSlots(source);
        setDrag(type, nodeId);
      },
    });
  };
  // A palette kind is inserted where a drop lands it, through the same insert a click on the palette makes
  const startPaletteDrag = (type: SurveyNodeType, event: PointerEvent) => {
    trackDrag(event, {
      draggedNodeId: "",
      draggedType: type,
      land: ({ index, slotPointer }) => {
        insertNodeAt(type, slotPointer, index);
      },
    });
  };
  // A node on the canvas dropped on a slot moves there, and a drop on the place it already holds changes nothing
  const startNodeDrag = (nodeId: string, event: PointerEvent) => {
    const nodePointer = getSurveyNodePointerById(surveyDocument.value, nodeId);
    const location = getSurveyNodeLocation(nodePointer);
    const node = location && getBlockNode(surveyDocument.value, nodePointer, surveyNodeChildren);
    if (location === undefined || node === undefined) return;

    const source = { ...location, nodePointer };
    trackDrag(event, {
      draggedNodeId: nodeId,
      draggedType: node.type,
      land: ({ index, slotPointer }) => {
        if (slotPointer === source.slotPointer && index === source.index) return;

        moveNodeTo(nodePointer, slotPointer, index);
      },
      source,
    });
  };
  // The element a palette drag would insert, drawn in the place it would land while the drag is over a slot. A node drag draws none
  const previewNode = computed<SurveyPlaceableNode | undefined>(() => {
    if (draggedType.value === undefined || draggedNodeId.value !== "") return undefined;

    const node = createSurveyNode(draggedType.value, crypto.randomUUID(), "question");
    if (node === undefined || node.type === SurveyNodeType.Page) return undefined;

    return node;
  });
  // A canvas registers how it measures its slots, and the registration ends with the scope that made it
  const registerSlots = (measure: () => SurveyDropSlot[]) => {
    setSlotMeasurer(measure);
    tryOnScopeDispose(() => {
      clearSlotMeasurer(measure);
    });
  };

  return {
    draggedType,
    dragPoint,
    dropTarget,
    isDragging,
    previewNode,
    registerSlots,
    startNodeDrag,
    startPaletteDrag,
  };
};
