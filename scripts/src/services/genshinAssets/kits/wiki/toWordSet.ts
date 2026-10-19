import { toTitleWords } from "#src/services/genshinAssets/kits/wiki/toTitleWords";

// A row title's or a table label's words as a set, where a text with no words is the empty set
export const toWordSet = (text: string): Set<string> =>
  new Set(
    toTitleWords(text)
      .split(" ")
      .filter((word) => word !== ""),
  );
