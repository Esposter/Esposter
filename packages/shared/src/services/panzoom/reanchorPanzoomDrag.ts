import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";

import { takeOne } from "#src/util/array/takeOne";

// A zoom or a reset moves the element, so a live drag carries on from its pointer's place and from the pan the element now has
export const reanchorPanzoomDrag = ({ drag, pointers, state }: PanzoomContext): void => {
  if (!drag) return;

  drag.anchorPoint = takeOne([...pointers.values()], 0);
  drag.anchorPan = { x: state.x, y: state.y };
};
