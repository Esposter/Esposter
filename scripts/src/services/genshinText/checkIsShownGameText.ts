import { getPlainGameText } from "#src/services/genshinText/getPlainGameText";

// Whether a text map string reads as the shown text once the game's colour tags and placeholder marker are gone, the
// case ignored unless the match is exact. A placeholder the game fills per value, such as a level, stays in the text,
// so a shown string with the value filled in does not match it
export const checkIsShownGameText = (text: string, shownText: string, isExact: boolean): boolean => {
  const plainText = getPlainGameText(text);
  return isExact ? plainText === shownText : plainText.toLowerCase() === shownText.toLowerCase();
};
