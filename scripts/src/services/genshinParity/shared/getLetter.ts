const FIRST_LETTER_CODE = 65;

export const getLetter = (index: number): string => String.fromCodePoint(FIRST_LETTER_CODE + index);
