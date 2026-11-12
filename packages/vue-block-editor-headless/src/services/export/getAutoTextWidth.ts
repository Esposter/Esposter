import type { TextSize } from "#src/models/TextSize";

import { getTextWidth } from "#src/services/export/getTextWidth";
import { getWrappedLines } from "#src/services/export/getWrappedLines";

// The width an unwrapped text takes: its widest drawn line at its size, and never less than one narrow character, so an empty text keeps a width.
// The lines are the ones the layout draws, which drop a paragraph's leading and repeated spaces, so the box is as wide as the text it shows
export const getAutoTextWidth = (text: string, textSize: TextSize): number =>
  getWrappedLines(text, { isWrapped: false, textSize, width: 0 }).reduce(
    (widest, line) => Math.max(widest, getTextWidth(line, textSize)),
    getTextWidth("a", textSize),
  );
