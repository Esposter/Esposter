import { PressMoveOutcome } from "@/models/ui/PressMoveOutcome";
import { TOUCH_DRAG_DELAY_MS } from "@/services/ui/constants";
import { getPressMoveOutcome } from "@/services/ui/getPressMoveOutcome";
import { holdPageStillWhile } from "@/services/ui/holdPageStillWhile";
import { swallowNextWindowClick } from "@/services/ui/swallowNextWindowClick";

// What a press tracked to its end hands its editor: where the drag starts, each move of it, what a release lands and the end
// Of the press however it came. The editor keeps what differs between editors, which is what a move draws and what a
// Release lands
export interface PressHandlers {
  // The press ended, by a release, a cancel, Escape or the returned cancel, whether or not it had become a drag
  onEnd?: () => void;
  // The drag's point where it starts, and then each move of it
  onMove?: (point: Point) => void;
  // A release of a drag, which is called with the point it was let go at and never for a press that stayed a click
  onRelease?: (point: Point) => void;
  // The press has become a drag, before its first move is drawn
  onStart?: () => void;
}

interface Point {
  x: number;
  y: number;
}

// The one tracker of a drag's press, shared by every editor's drag, and the drag's state they would each hold: whether the press
// Has become a drag, and where its pointer is. A press is a click until a mouse or a pen moves the drag start distance, or
// Until a finger rests the touch delay, and a finger that drifts first is scrolling, so its press ends there. A started drag
// Ends at its release, a pointer cancel or Escape, which goes no further, and the click a release over the control it began
// On would raise is swallowed, moved or not, since a finger that rested has started a drag too. A press still held when the
// Scope ends is cancelled
export const usePressDrag = () => {
  const isDragging = ref(false);
  const point = shallowRef<Point>();
  let cancelPress: (() => void) | undefined;
  tryOnScopeDispose(() => cancelPress?.());
  const startPress = (event: PointerEvent, { onEnd, onMove, onRelease, onStart }: PressHandlers = {}) => {
    cancelPress?.();
    const { clientX, clientY, pointerId, pointerType } = event;
    const stops: (() => void)[] = [];
    let isEnded = false;
    let restTimer: ReturnType<typeof setTimeout> | undefined;
    const end = () => {
      if (isEnded) return;

      isEnded = true;
      for (const stop of stops) stop();
      clearTimeout(restTimer);
      isDragging.value = false;
      point.value = undefined;
      onEnd?.();
    };
    const moveTo = (newPoint: Point) => {
      point.value = newPoint;
      onMove?.(newPoint);
    };
    const start = () => {
      if (isDragging.value || isEnded) return;

      isDragging.value = true;
      onStart?.();
      moveTo(point.value ?? { x: clientX, y: clientY });
    };
    stops.push(
      useEventListener("pointermove", (moveEvent) => {
        if (moveEvent.pointerId !== pointerId) return;

        const newPoint = { x: moveEvent.clientX, y: moveEvent.clientY };
        point.value = newPoint;
        if (isDragging.value) {
          moveTo(newPoint);
          return;
        }

        const distance = Math.hypot(newPoint.x - clientX, newPoint.y - clientY);
        const outcome = getPressMoveOutcome(pointerType, distance);
        if (outcome === PressMoveOutcome.Start) start();
        else if (outcome === PressMoveOutcome.Cancel) end();
      }),
      useEventListener("pointerup", (upEvent) => {
        if (upEvent.pointerId !== pointerId) return;

        if (isDragging.value) {
          onRelease?.({ x: upEvent.clientX, y: upEvent.clientY });
          swallowNextWindowClick();
        }
        end();
      }),
      useEventListener("pointercancel", end),
      // Escape cancels a drag in progress and goes no further, so a dialog the editor sits in stays open
      useEventListener(
        "keydown",
        (keyEvent) => {
          if (keyEvent.key !== "Escape" || !isDragging.value) return;

          keyEvent.preventDefault();
          keyEvent.stopPropagation();
          end();
        },
        { capture: true },
      ),
    );
    point.value = { x: clientX, y: clientY };
    if (pointerType === "touch") {
      restTimer = setTimeout(start, TOUCH_DRAG_DELAY_MS);
      stops.push(holdPageStillWhile(() => isDragging.value));
    }
    cancelPress = end;
  };

  return { cancel: () => cancelPress?.(), isDragging, point, startPress };
};
