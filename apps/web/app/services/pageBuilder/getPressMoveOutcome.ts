import { DRAG_START_DISTANCE } from "@/services/ui/constants";

// What a press does on a pointer move before its drag has begun. A mouse or pen press starts the drag once it moves past
// the threshold. A finger that moves past it has not rested, so it is scrolling and its press is cancelled. A finger inside
// the threshold waits, since its drag starts once it has rested the touch delay, which the caller times
export const getPressMoveOutcome = (pointerType: string, distance: number): "cancel" | "start" | "wait" => {
  if (distance < DRAG_START_DISTANCE) return "wait";

  return pointerType === "touch" ? "cancel" : "start";
};
