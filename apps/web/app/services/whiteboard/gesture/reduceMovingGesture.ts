import type { GestureMoving } from "@/models/whiteboard/GestureMoving";
import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { SnapResult } from "@/models/whiteboard/SnapResult";
import type { WhiteboardGestureResult } from "@/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";
import type { Point, PositionedDocument } from "vue-block-editor-headless";

import { GesturePointerAction } from "@/models/whiteboard/GesturePointerAction";
import { getBoxedSelectionBounds } from "@/services/whiteboard/gesture/getBoxedSelectionBounds";
import { getCopyMoveOperations } from "@/services/whiteboard/gesture/getCopyMoveOperations";
import { getMoveOperations } from "@/services/whiteboard/gesture/getMoveOperations";
import { getPreviewOrCommitResult } from "@/services/whiteboard/gesture/getPreviewOrCommitResult";
import { getSnap } from "@/services/whiteboard/gesture/getSnap";
import { getWorldPoint } from "@/services/whiteboard/gesture/getWorldPoint";
import { reducePreviewOrCommitGesture } from "@/services/whiteboard/gesture/reducePreviewOrCommitGesture";

// The snap a move takes at the pointer's delta: the boxes of the moving elements, moved by the delta, snapped to the other elements. Alt turns the snap
// Off, and a move of nothing that takes a box has nothing to snap
const getMoveSnap = (
  document: PositionedDocument,
  movingIds: string[],
  delta: Point,
  scale: number,
  isAltKey: boolean,
): SnapResult => {
  const movingBounds = isAltKey ? undefined : getBoxedSelectionBounds(document, movingIds);
  if (movingBounds === undefined) return { guides: [], offset: { x: 0, y: 0 } };

  return getSnap(
    document,
    movingIds,
    { ...movingBounds, x: movingBounds.x + delta.x, y: movingBounds.y + delta.y },
    scale,
  );
};

// A move previews the selection shifted by the pointer's travel from the press, snapped to the other elements, or the copies of it an Alt drag
// Makes, and holds the guides of the alignments it snapped to. A release commits the shift as one edit and clears the guides. A cancel of an Alt
// Drag restores the originals as the selection, since its copies are never made
export const reduceMovingGesture = (
  state: WhiteboardGestureState,
  gesture: GestureMoving,
  event: GesturePointerEvent,
): WhiteboardGestureResult => {
  if (event.action === GesturePointerAction.Cancel && gesture.originalIdCopyIdMap)
    return {
      operations: [],
      state: {
        ...state,
        gesture: undefined,
        preview: undefined,
        selectedIds: Object.keys(gesture.originalIdCopyIdMap),
      },
    };

  return reducePreviewOrCommitGesture(state, event, (action) => {
    const point = getWorldPoint(event.screen, state.viewport);
    const delta = { x: point.x - gesture.origin.x, y: point.y - gesture.origin.y };
    // An Alt drag's copies snap as the originals they were made from, which are the elements that move. Alt is read on each event, so holding it
    // Places the move where the pointer is for that event, and releasing it lets the next move snap again
    const movingIds = gesture.originalIdCopyIdMap ? Object.keys(gesture.originalIdCopyIdMap) : state.selectedIds;
    const snap = getMoveSnap(state.document, movingIds, delta, state.viewport.scale, event.isAltKey);
    const snappedDelta = { x: delta.x + snap.offset.x, y: delta.y + snap.offset.y };
    const operations = gesture.originalIdCopyIdMap
      ? getCopyMoveOperations(state.document, gesture.originalIdCopyIdMap, snappedDelta)
      : getMoveOperations(state.document, state.selectedIds, snappedDelta);
    const result = getPreviewOrCommitResult(state, operations, action);
    if (action === GesturePointerAction.Up) return result;

    return { ...result, state: { ...result.state, gesture: { ...gesture, guides: snap.guides } } };
  });
};
