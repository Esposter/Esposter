import type { GesturePlacing } from "@/models/whiteboard/GesturePlacing";
import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { WhiteboardGestureResult } from "@/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";

import { GesturePointerAction } from "@/models/whiteboard/GesturePointerAction";
import { GestureTool } from "@/models/whiteboard/GestureTool";
import { createWhiteboardElement } from "@/services/whiteboard/createWhiteboardElement";
import { checkIsDragStarted } from "@/services/whiteboard/gesture/checkIsDragStarted";
import { getDraggedBounds } from "@/services/whiteboard/gesture/getDraggedBounds";
import { getPreviewOrCommitResult } from "@/services/whiteboard/gesture/getPreviewOrCommitResult";
import { getWorldPoint } from "@/services/whiteboard/gesture/getWorldPoint";
import { reducePreviewOrCommitGesture } from "@/services/whiteboard/gesture/reducePreviewOrCommitGesture";
import { getPlacedBounds } from "@/services/whiteboard/getPlacedBounds";
import { insertPositionedElement } from "vue-block-editor-headless";

// A placing press previews its element once the pointer has travelled the drag start distance, sized by the drag. A release places the element
// As one edit and selects it: at the default size centred on the press for a click, or at the size of the drag. The tool returns to select
// Unless it is locked. The composable keeps this selection only when the document accepts the edit
export const reducePlacingGesture = (
  state: WhiteboardGestureState,
  gesture: GesturePlacing,
  event: GesturePointerEvent,
): WhiteboardGestureResult =>
  reducePreviewOrCommitGesture(state, event, (action) => {
    const isDragged = checkIsDragStarted(gesture.screen, event.screen);
    // Nothing is previewed before a drag, so a click's element does not appear at one size and then change to another
    if (!isDragged && action === GesturePointerAction.Move) return { operations: [], state };

    const point = getWorldPoint(event.screen, state.viewport);
    const bounds = isDragged
      ? getDraggedBounds(gesture.origin, point)
      : getPlacedBounds(gesture.placement, gesture.origin);
    const element = createWhiteboardElement(gesture.placement, gesture.elementId, bounds);
    const index = state.document.elements.length;
    const operations = insertPositionedElement(state.document, index, element);
    const result = getPreviewOrCommitResult(state, operations, action);
    if (action === GesturePointerAction.Move) return result;

    const tool = state.isToolLocked ? state.tool : GestureTool.Select;
    return { ...result, state: { ...result.state, selectedIds: [gesture.elementId], tool } };
  });
