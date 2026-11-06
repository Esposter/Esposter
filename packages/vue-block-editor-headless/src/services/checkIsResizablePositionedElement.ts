import type { PositionedElement } from "#src/models/PositionedElement";

import { PositionedElementType } from "#src/models/PositionedElementType";

// Whether an element takes a size of its own: an image, shape, sticky note or text box. An arrow and a stroke hold no size, so a resize leaves them be
export const checkIsResizablePositionedElement = (element: PositionedElement): boolean =>
  [
    PositionedElementType.Image,
    PositionedElementType.Shape,
    PositionedElementType.StickyNote,
    PositionedElementType.Text,
  ].includes(element.type);
