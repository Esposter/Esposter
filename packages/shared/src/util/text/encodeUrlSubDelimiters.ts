// `encodeURIComponent` leaves the sub-delimiters `!'()*` literal — the same characters that delimit a css
// `url('…')` — so they are additionally percent-encoded to close the emitted charset to `[\w.~%-]`
const EncodedSubDelimiterMap: Record<string, string> = {
  "!": "%21",
  "'": "%27",
  "(": "%28",
  ")": "%29",
  "*": "%2A",
};
const UNESCAPED_SUB_DELIMITER_REGEX = /[!'()*]/gu;

export const encodeUrlSubDelimiters = (value: string): string =>
  value.replaceAll(UNESCAPED_SUB_DELIMITER_REGEX, (character) => EncodedSubDelimiterMap[character] ?? character);
