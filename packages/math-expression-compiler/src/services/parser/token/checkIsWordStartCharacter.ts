import { WORD_START_REGEX } from "#src/services/parser/token/constants";

// A character that begins a name: an ASCII letter, underscore or dollar sign, or a letter beyond ASCII
// The ASCII range is compared by code, so a name's common characters never reach the expression
export const checkIsWordStartCharacter = (character: string): boolean => {
  if (character >= "\u0080") return WORD_START_REGEX.test(character);
  return (
    (character >= "a" && character <= "z") ||
    (character >= "A" && character <= "Z") ||
    character === "_" ||
    character === "$"
  );
};
