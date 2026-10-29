import { DEV_WORD_REGEX } from "#src/services/dev/constants";

// A console line's words, read off its spaces, except that a double-quoted run is one word without its quotes, so a place
// Of several words is named as `teleport "Liyue Harbor"`
export const splitDevLine = (line: string): string[] =>
  Array.from(line.matchAll(DEV_WORD_REGEX), ([word, quoted]) => quoted ?? word);
