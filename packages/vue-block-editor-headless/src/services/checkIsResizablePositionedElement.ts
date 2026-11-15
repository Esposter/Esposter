import type { PositionedElement } from "#src/models/PositionedElement";

import { PositionedElementType } from "#src/models/PositionedElementType";

// Whether an element takes a size of its own: an image, shape, sticky note or text box. An arrow and a stroke hold no size, so a resize leaves them be
export const checkIsResizablePositionedElement = (element: PositionedElement): boolean =>
  element.type === PositionedElementType.Image ||
  element.type === PositionedElementType.Shape ||
  element.type === PositionedElementType.StickyNote ||
  element.type === PositionedElementType.Text;
