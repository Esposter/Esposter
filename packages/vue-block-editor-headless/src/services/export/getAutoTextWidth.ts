import type { TextSize } from "#src/models/TextSize";

import { getTextWidth } from "#src/services/export/getTextWidth";

// The width an unwrapped text takes: its widest line at its size, and never less than one narrow character, so an empty text keeps a width
export const getAutoTextWidth = (text: string, textSize: TextSize): number =>
  text
    .split("\n")
    .reduce((widest, line) => Math.max(widest, getTextWidth(line, textSize)), getTextWidth("a", textSize));
