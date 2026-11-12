import type { ShapeElement } from "#src/models/ShapeElement";
import type { StickyNoteElement } from "#src/models/StickyNoteElement";
import type { TextElement } from "#src/models/TextElement";

import { HorizontalAlignment } from "#src/models/HorizontalAlignment";
import { PositionedElementType } from "#src/models/PositionedElementType";

// The horizontal alignment of a shape's, a sticky note's or a text box's text: the one it sets, or the one its kind takes until one is set
// A shape and a sticky note centre their text, and a text box starts it at its left edge
export const getHorizontalAlignment = (element: ShapeElement | StickyNoteElement | TextElement): HorizontalAlignment =>
  element.horizontalAlignment ??
  (element.type === PositionedElementType.Text ? HorizontalAlignment.Left : HorizontalAlignment.Center);
