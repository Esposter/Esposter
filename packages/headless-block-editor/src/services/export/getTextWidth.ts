import {
  TEXT_CHARACTER_WIDTH,
  TEXT_WIDE_CHARACTER_REGEX,
  TEXT_WIDE_CHARACTER_WIDTH,
} from "#src/services/export/constants";

// A text's width in document units by the estimate every export and editor shares: a full-width character takes double a narrow one
export const getTextWidth = (text: string): number => {
  let width = 0;
  for (const character of text)
    width += TEXT_WIDE_CHARACTER_REGEX.test(character) ? TEXT_WIDE_CHARACTER_WIDTH : TEXT_CHARACTER_WIDTH;
  return width;
};
