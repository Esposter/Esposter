import { toTitleWords } from "#src/services/genshinAssets/kits/wiki/toTitleWords";

// A row title's or a table label's words as a set, where a text with no words is the empty set
export const toWordSet = (text: string): Set<string> =>
  new Set(
    toTitleWords(text)
      .split(" ")
      // eslint-disable-next-line no-restricted-syntax -- a word of a wiki list, empty between separators
      .filter((word) => word !== ""),
  );
