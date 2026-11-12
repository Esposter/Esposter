import type { PositionedElement } from "vue-block-editor-headless";

import { getDefaultColor } from "@/services/whiteboard/palette/getDefaultColor";
import { getStrokeAttributes } from "vue-block-editor-headless";

// The stroke attributes an element draws its outline and text in, its own colour or else the default colour for it
export const getElementStrokeAttributes = (element: PositionedElement) =>
  getStrokeAttributes(element, getDefaultColor(element));
