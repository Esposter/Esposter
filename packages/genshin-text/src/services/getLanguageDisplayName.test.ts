import { GameLanguage } from "#src/models/GameLanguage";
import { getLanguageDisplayName } from "#src/services/getLanguageDisplayName";
import { describe, expect, test } from "vitest";

describe(getLanguageDisplayName, () => {
  test.each([
    [GameLanguage.Japanese, GameLanguage.Japanese, "日本語"],
    [GameLanguage.English, GameLanguage.Japanese, "英語"],
    [GameLanguage.Japanese, GameLanguage.English, "Japanese"],
    [GameLanguage.ChineseSimplified, GameLanguage.ChineseSimplified, "简体中文"],
  ])("%s named in %s", (languageName, inLanguageName, expected) => {
    expect.hasAssertions();

    expect(getLanguageDisplayName(languageName, inLanguageName)).toBe(expected);
  });

  // A reply language may be any language a person names, so a name that is not one of the game's is shown as given
  test.each([
    [" ", GameLanguage.English],
    [GameLanguage.English, " "],
  ])("falls back to the name given when %j or %j is no game language", (languageName, inLanguageName) => {
    expect.hasAssertions();

    expect(getLanguageDisplayName(languageName, inLanguageName)).toBe(languageName);
  });
});
