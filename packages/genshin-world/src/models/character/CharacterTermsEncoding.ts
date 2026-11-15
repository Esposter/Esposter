// The encodings a pack's terms are read in: UTF-16 by its byte-order mark, then UTF-8, then the legacy encodings of the
// Japanese and the Chinese packs, each by its WHATWG label
export const CharacterTermsEncoding = {
  Gbk: "gbk",
  ShiftJis: "shift_jis",
  Utf8: "utf8",
  Utf16BigEndian: "utf-16be",
  Utf16LittleEndian: "utf-16le",
} as const;
export type CharacterTermsEncoding = (typeof CharacterTermsEncoding)[keyof typeof CharacterTermsEncoding];
