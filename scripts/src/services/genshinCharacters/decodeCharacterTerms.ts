import type { CharacterTerms } from "#src/models/genshinCharacters/CharacterTerms";

import { CharacterTermsEncoding } from "#src/models/genshinCharacters/CharacterTermsEncoding";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";

// What a Shift-JIS reading of Chinese text turns up and Japanese terms never hold: the half-width katakana a GBK lead
// Byte reads as, and the private-use letters its highest lead bytes map to
const NOT_JAPANESE_PATTERN = /[-｡-ﾟ]/u;

const getEncodings = (bytes: Uint8Array): CharacterTermsEncoding[] => {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return [CharacterTermsEncoding.Utf16LittleEndian];
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return [CharacterTermsEncoding.Utf16BigEndian];
  return [CharacterTermsEncoding.Utf8, CharacterTermsEncoding.ShiftJis, CharacterTermsEncoding.Gbk];
};

// A pack's terms as text, decoded strictly, so a byte no character maps refuses the encoding rather than being replaced
// And the text is kept whole: a byte-order mark names UTF-16, and without one UTF-8 is tried, then Shift-JIS for a
// Japanese pack and GBK for a Chinese one. Bytes both legacy encodings read are Shift-JIS only when they read as
// Japanese, since GBK's lead bytes read as half-width katakana under it
export const decodeCharacterTerms = (bytes: Uint8Array): CharacterTerms => {
  const encodings = getEncodings(bytes);
  for (const encoding of encodings) {
    const text = getResult(() => new TextDecoder(encoding, { fatal: true }).decode(bytes)).unwrapOr(undefined);
    if (text !== undefined && !(encoding === CharacterTermsEncoding.ShiftJis && NOT_JAPANESE_PATTERN.test(text)))
      return { encoding, text };
  }
  throw new InvalidOperationError(Operation.Read, "terms", `decode in none of ${encodings.join(", ")}`);
};
