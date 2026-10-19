// A decimal digit. Only the ASCII digits are read, so the comparison is the whole test
export const checkIsDigitCharacter = (character: string): boolean => character >= "0" && character <= "9";
