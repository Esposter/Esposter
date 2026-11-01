import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";
import type { PanzoomElement } from "#src/models/panzoom/PanzoomElement";

// The element a pointer goes down on and the cursor is written to: the parent when canvas is set, the element otherwise
export const getPanzoomTarget = ({ element, options, parent }: PanzoomContext): PanzoomElement =>
  options.canvas ? parent : element;
