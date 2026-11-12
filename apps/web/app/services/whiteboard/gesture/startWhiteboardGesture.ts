import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { WhiteboardGestureResult } from "@/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";

import { GesturePhase } from "@/models/whiteboard/GesturePhase";
import { GesturePointerAction } from "@/models/whiteboard/GesturePointerAction";
import { GestureTool } from "@/models/whiteboard/GestureTool";
import { MIDDLE_BUTTON, PRIMARY_BUTTON } from "@/services/whiteboard/gesture/constants";
import { getArrowEnd } from "@/services/whiteboard/gesture/getArrowEnd";
import { getHitElementId } from "@/services/whiteboard/gesture/getHitElementId";
import { getHitTolerance } from "@/services/whiteboard/gesture/getHitTolerance";
import { getPressedSelection } from "@/services/whiteboard/gesture/getPressedSelection";
import { getResizeHandle } from "@/services/whiteboard/gesture/getResizeHandle";
import { getStrokeOperations } from "@/services/whiteboard/gesture/getStrokeOperations";
import { getWorldPoint } from "@/services/whiteboard/gesture/getWorldPoint";
import { startPlacingGesture } from "@/services/whiteboard/gesture/startPlacingGesture";
import { applyPatches, exhaustiveGuard } from "@esposter/shared";
import { PositionedElementType } from "vue-block-editor-headless";

// An idle canvas takes a press. The middle button, the hand tool and Space held pan, the freehand tool starts a stroke, and the arrow tool
// Starts an arrow from the press. A shape, sticky note or text tool starts a placement at the press. The select tool takes the press on a
// Resize handle, an element or the canvas. Any other event changes nothing
export const startWhiteboardGesture = (
  state: WhiteboardGestureState,
  event: GesturePointerEvent,
): WhiteboardGestureResult => {
  if (event.action !== GesturePointerAction.Down) return { operations: [], state };

  if (event.button === MIDDLE_BUTTON || state.tool === GestureTool.Hand || state.isSpaceHeld)
    return {
      operations: [],
      state: {
        ...state,
        gesture: {
          phase: GesturePhase.Panning,
          pointerId: event.pointerId,
          screen: event.screen,
          viewportOrigin: { x: state.viewport.x, y: state.viewport.y },
        },
      },
    };
  if (event.button !== PRIMARY_BUTTON) return { operations: [], state };

  const origin = getWorldPoint(event.screen, state.viewport);
  switch (state.tool) {
    case GestureTool.Arrow:
      return {
        operations: [],
        state: {
          ...state,
          gesture: {
            elementId: state.createId(),
            phase: GesturePhase.Arrow,
            pointerId: event.pointerId,
            screen: event.screen,
            start: getArrowEnd(state, origin, false),
          },
        },
      };
    case GestureTool.Freehand: {
      const elementId = state.createId();
      const points = [origin];
      return {
        operations: [],
        state: {
          ...state,
          gesture: { elementId, phase: GesturePhase.Drawing, pointerId: event.pointerId, points },
          preview: applyPatches(state.document, getStrokeOperations(state.document, elementId, points)).document,
        },
      };
    }
    case GestureTool.Select: {
      const tolerance = getHitTolerance(state.viewport.scale);
      const handle = getResizeHandle(state.document, state.selectedIds, origin, tolerance);
      const elementId = handle === undefined ? (getHitElementId(state.document, origin, tolerance) ?? "") : "";
      const selectedIds =
        !elementId || handle !== undefined
          ? state.selectedIds
          : getPressedSelection(state.selectedIds, elementId, event.isShiftKey);
      // Alt on an element fixes the copy id of each element the press leaves selected, so a drag that starts from the press copies them under those ids
      const originalIdCopyIdMap =
        event.isAltKey && elementId
          ? Object.fromEntries(selectedIds.map((selectedId): [string, string] => [selectedId, state.createId()]))
          : undefined;
      return {
        operations: [],
        state: {
          ...state,
          gesture: {
            elementId,
            handle,
            isAdditive: event.isShiftKey,
            origin,
            originalIdCopyIdMap,
            phase: GesturePhase.Pressed,
            pointerId: event.pointerId,
            screen: event.screen,
          },
          selectedIds,
        },
      };
    }
    case GestureTool.Shape:
      return startPlacingGesture(state, event, { kind: state.shapeKind, type: PositionedElementType.Shape });
    case GestureTool.StickyNote:
      return startPlacingGesture(state, event, { type: PositionedElementType.StickyNote });
    case GestureTool.Text:
      return startPlacingGesture(state, event, { type: PositionedElementType.Text });
    default:
      return exhaustiveGuard(state.tool);
  }
};
