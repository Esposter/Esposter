import type { TextSize } from "#src/models/TextSize";

import {
  TEXT_CHARACTER_WIDTH_SHARE,
  TEXT_WIDE_CHARACTER_FACTOR,
  TEXT_WIDE_CHARACTER_REGEX,
} from "#src/services/export/constants";

// A text's width in document units by the estimate every export and editor shares: a full-width character takes double a narrow one, and both grow with the text's size
export const getTextWidth = (text: string, textSize: TextSize): number => {
  const narrowWidth = textSize * TEXT_CHARACTER_WIDTH_SHARE;
  let width = 0;
  for (const character of text)
    width += TEXT_WIDE_CHARACTER_REGEX.test(character) ? narrowWidth * TEXT_WIDE_CHARACTER_FACTOR : narrowWidth;
  return width;
};
