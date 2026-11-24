import type { PositionedElement, TextPlacement } from "vue-block-editor-headless";

import { getAutoTextWidth, getTextPlacement, PositionedElementType } from "vue-block-editor-headless";

// Where an element's text is drawn while its draft is edited: the element's placement, with the draft as its text.
// An unwrapped text box is as wide as the draft's widest line, which is the width the commit stores.
// The draft and the committed text are therefore drawn at the same place.
export const getDraftPlacement = (element: PositionedElement, draft: string): TextPlacement | undefined => {
  if (element.type !== PositionedElementType.Text || element.isWrapped) return getTextPlacement(element);

  return getTextPlacement({ ...element, text: draft, width: getAutoTextWidth(draft, element.textSize) });
};
