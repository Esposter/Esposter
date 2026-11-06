import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { SurveyDropSlot } from "@/models/resource/survey/SurveyDropSlot";
import type { SurveyPlaceableNode } from "headless-survey-engine";

import { useSurveyCreatorCommands } from "@/composables/survey/useSurveyCreatorCommands";
import { createSurveyNode } from "@/services/resource/survey/createSurveyNode";
import { getSurveyNodeLocation } from "@/services/resource/survey/getSurveyNodeLocation";
import { getSurveyNodePointerById } from "@/services/resource/survey/getSurveyNodePointerById";
import { resolveSurveyDropTarget } from "@/services/resource/survey/resolveSurveyDropTarget";
import { DRAG_START_DISTANCE, LONG_PRESS_MOVE_TOLERANCE, TOUCH_DRAG_DELAY_MS } from "@/services/ui/constants";
import { holdPageStillWhile } from "@/services/ui/holdPageStillWhile";
import { swallowNextWindowClick } from "@/services/ui/swallowNextWindowClick";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { useSurveyCreatorDragStore } from "@/store/survey/creatorDrag";
import { getBlockNode } from "headless-block-editor";
import { SurveyNodeType, surveyNodeChildren } from "headless-survey-engine";

// The node a drag moves: its pointer, and the slot and index it sits at, which its own slot loses from the boxes a drop reads
type DragSource = { index: number; nodePointer: string; slotPointer: string };
// The drag a palette kind or a canvas node starts, shared by every pane through the store, so the canvas draws what the palette
// starts. A press is a click until it moves the drag distance, or, for a finger, until it rests the touch delay; a finger that
// moves first is scrolling, so its press ends there. A release over a slot lands the drag as one command, and a release over
// no slot, Escape or a cancel changes nothing
export const useSurveyCreatorDrag = () => {
  const surveyCreatorDragStore = useSurveyCreatorDragStore();
  const { dragPoint, dropTarget, draggedNodeId, draggedType, isDragging } = storeToRefs(surveyCreatorDragStore);
  const { clearDrag, clearSlotMeasurer, measureSlots, moveDrag, setDrag, setSlotMeasurer } = surveyCreatorDragStore;
  const surveyCreatorStore = useSurveyCreatorStore();
  const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
  const { insertNodeAt, moveNodeTo } = useSurveyCreatorCommands();
  // The slots a drag lands in, read off the canvas as the drag starts, so the preview it draws moves no box a move reads. A node
  // cannot land inside itself, and its own slot loses the node's box, so the index a drop resolves is the one the core takes once
  // the node is removed
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
    const abortController = new AbortController();
    const { signal } = abortController;
    const { clientX, clientY, pointerId, pointerType } = event;
    let lastPoint = { x: clientX, y: clientY };
    let isStarted = false;
    let slots: SurveyDropSlot[] = [];
    let touchTimer: ReturnType<typeof setTimeout> | undefined;
    const resolveAt = (point: { x: number; y: number }) => resolveSurveyDropTarget({ draggedType: type, point, slots });
    const endPress = () => {
      abortController.abort();
      clearTimeout(touchTimer);
      if (isStarted) clearDrag();
    };
    const startDrag = () => {
      isStarted = true;
      slots = getDropSlots(source);
      setDrag(type, nodeId);
      moveDrag(lastPoint, resolveAt(lastPoint));
    };
    const onPointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;

      lastPoint = { x: moveEvent.clientX, y: moveEvent.clientY };
      if (isStarted) {
        moveDrag(lastPoint, resolveAt(lastPoint));
        return;
      }

      const distance = Math.hypot(lastPoint.x - clientX, lastPoint.y - clientY);
      if (pointerType === "touch") {
        if (distance > LONG_PRESS_MOVE_TOLERANCE) endPress();
      } else if (distance >= DRAG_START_DISTANCE) startDrag();
    };
    const onPointerUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId !== pointerId) return;

      if (isStarted) {
        const target = resolveAt({ x: upEvent.clientX, y: upEvent.clientY });
        if (target !== undefined) land(target);
        swallowNextWindowClick();
      }
      endPress();
    };
    // Escape cancels a drag in progress and goes no further, so a dialog the canvas sits in stays open
    const onKeyDown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key !== "Escape" || !isStarted) return;

      keyEvent.preventDefault();
      keyEvent.stopPropagation();
      endPress();
    };
    window.addEventListener("pointermove", onPointerMove, { signal });
    window.addEventListener("pointerup", onPointerUp, { signal });
    window.addEventListener("pointercancel", endPress, { signal });
    window.addEventListener("keydown", onKeyDown, { capture: true, signal });
    if (pointerType === "touch") {
      touchTimer = setTimeout(startDrag, TOUCH_DRAG_DELAY_MS);
      holdPageStillWhile(() => isStarted, signal);
    }
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
    dragPoint,
    draggedType,
    dropTarget,
    isDragging,
    previewNode,
    registerSlots,
    startNodeDrag,
    startPaletteDrag,
  };
};
