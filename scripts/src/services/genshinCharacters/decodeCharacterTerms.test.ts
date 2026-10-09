import { CharacterTermsEncoding } from "#src/models/genshinCharacters/CharacterTermsEncoding";
import { decodeCharacterTerms } from "#src/services/genshinCharacters/decodeCharacterTerms";
import { describe, expect, test } from "vitest";

describe(decodeCharacterTerms, () => {
  // Chinese text in GBK reads as Shift-JIS too, its lead bytes as half-width katakana, so it is read as GBK
  test.each([
    { bytes: [0xe3, 0x81, 0x82], encoding: CharacterTermsEncoding.Utf8, text: "あ" },
    { bytes: [0x82, 0xa0], encoding: CharacterTermsEncoding.ShiftJis, text: "あ" },
    { bytes: [0xc4, 0xe3, 0xba, 0xc3], encoding: CharacterTermsEncoding.Gbk, text: "你好" },
    { bytes: [0xff, 0xfe, 0x42, 0x30], encoding: CharacterTermsEncoding.Utf16LittleEndian, text: "あ" },
  ])("reads $encoding", ({ bytes, encoding, text }) => {
    expect.hasAssertions();
    expect(decodeCharacterTerms(Uint8Array.from(bytes))).toStrictEqual({ encoding, text });
  });

  test("refuses bytes no encoding reads whole", () => {
    expect.hasAssertions();
    expect(() => decodeCharacterTerms(Uint8Array.of(0xff))).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: terms, decode in none of utf8, shift_jis, gbk]`,
    );
  });
});
