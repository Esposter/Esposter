// `encodeURIComponent` leaves the sub-delimiters `!'()*` literal — the same characters that delimit a css
// `url('…')` — so they are additionally percent-encoded to close the emitted charset to `[\w.~%-]`
const EncodedSubDelimiterMap = {
  "!": "%21",
  "'": "%27",
  "(": "%28",
  ")": "%29",
  "*": "%2A",
} as const satisfies Record<string, string>;

export const encodeUrlSubDelimiters = (value: string): string =>
  Object.entries(EncodedSubDelimiterMap).reduce(
    (encoded, [subDelimiter, encodedSubDelimiter]) => encoded.replaceAll(subDelimiter, encodedSubDelimiter),
    value,
  );
