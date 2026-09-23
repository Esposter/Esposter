// A maximal run of identifier characters, `$` included — `\w` alone would split `$trpc` into `trpc` and read a
// Name carrying a `$` as one it never contains.
const NON_IDENTIFIER_REGEX = /[^\w$]+/u;
// Every identifier a text spells, once
export const getIdentifiers = (text: string): Set<string> => new Set(text.split(NON_IDENTIFIER_REGEX).filter(Boolean));
