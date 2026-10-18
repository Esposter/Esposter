import { checkIsDigitCharacter } from "#src/services/parser/token/checkIsDigitCharacter";
import { checkIsWordStartCharacter } from "#src/services/parser/token/checkIsWordStartCharacter";
import { WORD_CHARACTER_REGEX } from "#src/services/parser/token/constants";

// A character a name may continue with: one that begins a name, or a digit. Beyond ASCII the expression tests it
export const checkIsWordCharacter = (character: string): boolean => {
  if (character >= "\u0080") return WORD_CHARACTER_REGEX.test(character);
  return checkIsWordStartCharacter(character) || checkIsDigitCharacter(character);
};
