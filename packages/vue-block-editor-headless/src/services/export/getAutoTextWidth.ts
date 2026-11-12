import type { TextSize } from "#src/models/TextSize";

import { TEXT_CHARACTER_WIDTH_SHARE } from "#src/services/export/constants";
import { getTextWidth } from "#src/services/export/getTextWidth";

// The width an unwrapped text takes: its widest line at its size, and never less than one narrow character, so an empty text keeps a width
export const getAutoTextWidth = (text: string, textSize: TextSize): number =>
  text
    .split("\n")
    .reduce((widest, line) => Math.max(widest, getTextWidth(line, textSize)), textSize * TEXT_CHARACTER_WIDTH_SHARE);
