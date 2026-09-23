const WORD_REGEX = /[\w$]+/gu;
// Every identifier-shaped run of `text` into `words`
export const addWords = (words: Set<string>, text: string): void => {
  for (const match of text.matchAll(WORD_REGEX)) words.add(match[0]);
};
