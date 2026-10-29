import type { DragReorderContext } from "@/models/ui/dragReorder/DragReorderContext";
import type { Press } from "@/models/ui/dragReorder/Press";

// Ends a press's listeners, observer and the wait for a touch to rest, and forgets it if it is the press in progress
export const endPress = (context: DragReorderContext, currentPress: Press) => {
  currentPress.listeners.abort();
  currentPress.observer?.disconnect();
  context.stopTouchDelay();
  if (context.press === currentPress) context.press = undefined;
};
