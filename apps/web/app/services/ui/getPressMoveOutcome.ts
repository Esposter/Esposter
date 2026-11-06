import { DRAG_START_DISTANCE, LONG_PRESS_MOVE_TOLERANCE } from "@/services/ui/constants";

// What a press does on a pointer move before its drag has begun. A mouse or pen press starts the drag once it moves the drag
// Start distance. A finger that drifts past the long press tolerance has not rested, so it is scrolling and its press is
// Cancelled. A finger inside the tolerance waits, since its drag starts once it has rested the touch delay, which the caller times
export const getPressMoveOutcome = (pointerType: string, distance: number): "cancel" | "start" | "wait" => {
  if (pointerType === "touch") return distance > LONG_PRESS_MOVE_TOLERANCE ? "cancel" : "wait";

  return distance >= DRAG_START_DISTANCE ? "start" : "wait";
};
