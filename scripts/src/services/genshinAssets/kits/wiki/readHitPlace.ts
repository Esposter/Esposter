const HIT_PLACE_REGEX = /\s(?:(?<number>\d+)|(?<letter>[a-z]))$/iu;
const LETTER_A_CODE_POINT = "A".codePointAt(0) ?? 0;

// The place a text ends with, `2` for `4-Hit DMG 2` and `4-Hit DMG B` alike, a letter counting from `A` as 1, or
// Undefined where the text ends with neither a whole number nor a letter
export const readHitPlace = (text: string): number | undefined => {
  const groups = HIT_PLACE_REGEX.exec(text)?.groups;
  if (groups?.number !== undefined) return Number(groups.number);
  if (groups?.letter === undefined) return undefined;
  return (groups.letter.toUpperCase().codePointAt(0) ?? 0) - LETTER_A_CODE_POINT + 1;
};
