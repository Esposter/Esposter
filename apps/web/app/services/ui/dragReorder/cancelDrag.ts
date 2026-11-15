import type { DragReorderContext } from "#src/models/ui/dragReorder/DragReorderContext";
import type { Press } from "#src/models/ui/dragReorder/Press";

import { settleDrag } from "#src/services/ui/dragReorder/settleDrag";

// Every row goes back, and the release still to come raises a click that is swallowed like a drop's
export const cancelDrag = (context: DragReorderContext, currentPress: Press) => {
  if (!currentPress.drag) return;
  currentPress.isCancelled = true;
  settleDrag(context, currentPress, currentPress.drag, currentPress.index);
};
