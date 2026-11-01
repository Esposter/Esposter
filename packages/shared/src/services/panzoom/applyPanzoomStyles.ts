import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";

import {
  PANZOOM_DEFAULT_CURSOR,
  PANZOOM_DEFAULT_OVERFLOW,
  PANZOOM_DEFAULT_TOUCH_ACTION,
} from "#src/services/panzoom/constants";
import { getPanzoomTarget } from "#src/services/panzoom/getPanzoomTarget";
import { restorePanzoomStyles } from "#src/services/panzoom/restorePanzoomStyles";
import { writePanzoomStyle } from "#src/services/panzoom/writePanzoomStyle";

// Writes the styles the options name: the parent's overflow and touch action, the element's touch action, and the cursor
// On the target while panning is possible. A disabled pan leaves the cursor to the stylesheet, so any written one is restored
export const applyPanzoomStyles = (context: PanzoomContext): void => {
  const { element, options, parent } = context;
  const touchAction = options.touchAction ?? PANZOOM_DEFAULT_TOUCH_ACTION;
  writePanzoomStyle(context, parent, "overflow", options.overflow ?? PANZOOM_DEFAULT_OVERFLOW);
  writePanzoomStyle(context, parent, "touch-action", touchAction);
  writePanzoomStyle(context, element, "touch-action", touchAction);
  if (options.disablePan) restorePanzoomStyles(context, ["cursor"]);
  else writePanzoomStyle(context, getPanzoomTarget(context), "cursor", options.cursor ?? PANZOOM_DEFAULT_CURSOR);
};
