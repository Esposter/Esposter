const BOOLEAN_REGEX = /^(?:true|false)$/iu;
// The lookahead names the reserved prefix in full: `xmlns` alone also spares an ordinary `xmlnsfoo:` prefix.
// That is a namespaced name like any other and owes its local name back
const PREFIX_MATCH_REGEX = /^(?!xmlns:).*:/u;

// The processors the upstream package exported, under the same names, so a parser's value and name processors take
// The same functions a migrating caller already passes
export const processors = {
  firstCharLowerCase: (string: string): string => string.charAt(0).toLowerCase() + string.slice(1),
  normalize: (string: string): string => string.toLowerCase(),
  parseBooleans: (string: string): boolean | string =>
    BOOLEAN_REGEX.test(string) ? string.toLowerCase() === "true" : string,
  // A blank string is not a number, and `Number` would read it as zero, so it passes through as the empty text it is
  parseNumbers: (string: string): number | string => {
    if (string.trim() === "") return string;
    const number = Number(string);
    return Number.isNaN(number) ? string : number;
  },
  stripPrefix: (string: string): string => string.replace(PREFIX_MATCH_REGEX, ""),
};
