const WORD_BREAK_REGEX = /[^A-Za-z0-9]+(?<letter>[A-Za-z0-9])/gu;
// "Hu Tao" → "huTao", "ChineseSimplified" → "chineseSimplified": the name a persona module is exported as, and the
// File it is kept in — the first letter lowered, each later word capitalised, and a capital inside a word kept
export const getPersonaCardName = (name: string): string =>
  `${name.charAt(0).toLowerCase()}${name.slice(1)}`.replaceAll(WORD_BREAK_REGEX, (_match, letter: string) =>
    letter.toUpperCase(),
  );
