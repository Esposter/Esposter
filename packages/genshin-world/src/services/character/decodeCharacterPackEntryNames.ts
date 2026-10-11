import { decodeCharacterTerms } from "#src/services/character/decodeCharacterTerms";
import { getResult } from "@esposter/shared";

// A name fflate read as Latin-1, a letter a byte, because the archive left it unflagged as UTF-8: a letter past ASCII
// And none past a byte. A name with a letter past a byte was flagged and read as UTF-8
const checkIsLegacyName = (name: string): boolean => {
  const codePoints = Array.from(name, (letter) => letter.codePointAt(0) ?? 0);
  return codePoints.some((codePoint) => codePoint > 0x7f) && codePoints.every((codePoint) => codePoint <= 0xff);
};

// Shift-JIS bytes with the slash after each lead byte turned back into the backslash it was. An archiver that writes
// Backslashes as separators also rewrites a letter's 0x5C trail byte, as Ningguang's, Klee's and Chongyun's releases
// Do to "表" in "表情", so the name reads in no encoding until it is restored
const restoreTrailBackslashes = (bytes: Uint8Array): Uint8Array => {
  const restored = Uint8Array.from(bytes);
  for (let index = 0; index < restored.length - 1; index++) {
    const byte = restored[index] ?? 0;
    if ((byte < 0x81 || byte > 0x9f) && (byte < 0xe0 || byte > 0xfc)) continue;
    index++;
    if (restored[index] === 0x2f) restored[index] = 0x5c;
  }
  return restored;
};

// An archive's entry names as the release wrote them, from fflate's readings: every name it left unflagged as UTF-8 is
// Read back to its bytes and decoded with the rest by the rule a pack's terms are, strictly as UTF-8, else Shift-JIS
// Where they read as Japanese, else GBK, so one archive's legacy names share their encoding. The official releases mix
// Flagged UTF-8 names with Shift-JIS or GBK ones in one archive. Names no encoding reads whole are read again with
// Their Shift-JIS trail backslashes restored, and names that still read in none keep fflate's reading
export const decodeCharacterPackEntryNames = (names: readonly string[]): string[] => {
  const legacyNames = names.filter((name) => checkIsLegacyName(name));
  if (legacyNames.length === 0) return [...names];
  // A line feed is never a byte of a multi-byte letter in any of the encodings, so it parts the names
  const bytes = Uint8Array.from(legacyNames.join("\n"), (letter) => letter.codePointAt(0) ?? 0);
  const decodedNames = getResult(() => decodeCharacterTerms(bytes).text)
    .orElse(() => getResult(() => decodeCharacterTerms(restoreTrailBackslashes(bytes)).text))
    .map((text) => text.split("\n"))
    .unwrapOr(legacyNames);
  const legacyNameMap = new Map(legacyNames.map((name, index) => [name, decodedNames[index] ?? name]));
  return names.map((name) => legacyNameMap.get(name) ?? name);
};
