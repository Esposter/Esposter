const WORD_BREAK_REGEX = /[^a-z0-9]+(?<letter>[a-z0-9])/gu;
// "Hu Tao" → "huTao": the name a character's persona card is exported as, and the file it is kept in
export const getPersonaCardName = (name: string): string =>
  name.toLowerCase().replace(WORD_BREAK_REGEX, (_match, letter: string) => letter.toUpperCase());
