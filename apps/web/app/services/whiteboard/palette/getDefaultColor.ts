import type { PositionedElement } from "vue-block-editor-headless";

import { WHITEBOARD_TEXT_COLOR } from "@/services/whiteboard/palette/constants";
import { EXPORT_LINE_COLOR } from "vue-block-editor-headless";

// The colour an element with none of its own draws its outline and text in. The page's text colour follows the theme, which reads on the page but not on
// A fill the theme does not change, so an element with a fill draws in the export's dark line colour, as the export draws every element
export const getDefaultColor = (element: PositionedElement): string =>
  "fill" in element && element.fill ? EXPORT_LINE_COLOR : WHITEBOARD_TEXT_COLOR;
