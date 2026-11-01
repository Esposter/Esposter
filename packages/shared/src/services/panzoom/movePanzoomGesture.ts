import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";

import { movePanzoomDrag } from "#src/services/panzoom/movePanzoomDrag";
import { movePanzoomPinch } from "#src/services/panzoom/movePanzoomPinch";
import { takeOne } from "#src/util/array/takeOne";

// A move of a pointer that is down records its point, then the pinch or the drag that pointer is part of follows it. A drag is
// The first pointer's, so a second pointer that started no pinch moves nothing
export const movePanzoomGesture = (context: PanzoomContext, event: PointerEvent): void => {
  const { drag, pinch, pointers } = context;
  if (!pointers.has(event.pointerId)) return;

  const point = { x: event.clientX, y: event.clientY };
  pointers.set(event.pointerId, point);
  if (pinch) movePanzoomPinch(context, pinch, event);
  else if (drag && event.pointerId === takeOne([...pointers.keys()], 0)) movePanzoomDrag(context, drag, point, event);
};
