// Azure signs urls with `encodeURIComponent`, which leaves `!'()*` literal — the same characters that
// Delimit a css `url('…')` and appear unescaped in a download SAS's `rscd` filename, so a url carrying them
// Cannot be matched unambiguously inside serialized content. Percent-encoding them is transparent to the
// Service, which decodes the request before validating the signature, so every url we hand out is canonical
const EncodedSubDelimiterMap: Record<string, string> = {
  "!": "%21",
  "'": "%27",
  "(": "%28",
  ")": "%29",
  "*": "%2A",
};
const UNESCAPED_SUB_DELIMITER_REGEX = /[!'()*]/gu;

export const encodeBlobUrl = (blobUrl: string) =>
  blobUrl.replaceAll(UNESCAPED_SUB_DELIMITER_REGEX, (character) => EncodedSubDelimiterMap[character] ?? character);
