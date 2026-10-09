import { decodeCharacterPackEntryNames } from "#src/services/character/decodeCharacterPackEntryNames";
import { describe, expect, test } from "vitest";

// A name as fflate reads one the archive leaves unflagged as UTF-8, a letter a byte
const getLatin1Name = (bytes: number[]): string => String.fromCodePoint(...bytes);

describe(decodeCharacterPackEntryNames, () => {
  test("keeps the names fflate read as UTF-8 and the ASCII ones", () => {
    expect.hasAssertions();
    expect(decodeCharacterPackEntryNames(["凝光", "a"])).toStrictEqual(["凝光", "a"]);
  });

  // Ningguang's release writes "凝光" in Shift-JIS beside names flagged as UTF-8, and Zhongli's writes "发" in GBK, which
  // Reads as half-width katakana in Shift-JIS
  test.each([
    { bytes: [0x8b, 0xc3, 0x8c, 0xf5], name: "凝光" },
    { bytes: [0xb7, 0xa2], name: "发" },
  ])("decodes $name", ({ bytes, name }) => {
    expect.hasAssertions();
    expect(decodeCharacterPackEntryNames(["凝光", getLatin1Name(bytes)])).toStrictEqual(["凝光", name]);
  });

  // "唷" in GBK reads as "爍" in Shift-JIS on its own, and beside "发" the archive's names read as GBK alone
  test("decodes an archive's legacy names in one encoding", () => {
    expect.hasAssertions();
    expect(decodeCharacterPackEntryNames([getLatin1Name([0xe0, 0xa1]), getLatin1Name([0xb7, 0xa2])])).toStrictEqual([
      "唷",
      "发",
    ]);
  });

  test("keeps fflate's reading of names no encoding reads whole", () => {
    expect.hasAssertions();

    const name = getLatin1Name([0xff]);

    expect(decodeCharacterPackEntryNames([name])).toStrictEqual([name]);
  });
});
