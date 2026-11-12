import type { ShapeElement } from "#src/models/ShapeElement";
import type { StickyNoteElement } from "#src/models/StickyNoteElement";

import { VerticalAlignment } from "#src/models/VerticalAlignment";

// The vertical alignment of a shape's or a sticky note's text: the one it sets, or centred until one is set
export const getVerticalAlignment = (element: ShapeElement | StickyNoteElement): VerticalAlignment =>
  element.verticalAlignment ?? VerticalAlignment.Middle;
