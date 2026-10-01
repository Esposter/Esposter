import { GameLanguage } from "#src/models/GameLanguage";
import { matchGameLanguage } from "#src/services/matchGameLanguage";
import { describe, expect, test } from "vitest";

describe(matchGameLanguage, () => {
  test.each([
    [["zh-TW"], GameLanguage.ChineseTraditional],
    [["zh-HK"], GameLanguage.ChineseTraditional],
    [["zh-CN"], GameLanguage.ChineseSimplified],
    [["zh"], GameLanguage.ChineseSimplified],
    [["pt-BR"], GameLanguage.Portuguese],
    [["en-GB"], GameLanguage.English],
    [["ja-JP", "en"], GameLanguage.Japanese],
    [["nl", "de"], GameLanguage.German],
  ])("%j reads %s", (preferredTags, expected) => {
    expect.hasAssertions();

    expect(matchGameLanguage(preferredTags)).toBe(expected);
  });

  // A malformed tag is skipped rather than thrown on, since a header is anyone's to write
  test.each([[[]], [["nl"]], [["*"]], [["ja-12"]], [["ja_JP"]]])("%j falls back to English", (preferredTags) => {
    expect.hasAssertions();

    expect(matchGameLanguage(preferredTags)).toBe(GameLanguage.English);
  });
});
