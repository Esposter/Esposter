import { DEFAULT_LANGUAGE } from "#src/services/constants";
import { getLanguageDisplayName } from "#src/services/getLanguageDisplayName";
import { describe, expect, test } from "vitest";

describe(getLanguageDisplayName, () => {
  test.each([
    ["Japanese", "Japanese", "日本語"],
    ["English", "Japanese", "英語"],
    ["Japanese", DEFAULT_LANGUAGE, "Japanese"],
    ["ChineseSimplified", "ChineseSimplified", "简体中文"],
  ])("%s named in %s", (languageName, inLanguageName, expected) => {
    expect.hasAssertions();

    expect(getLanguageDisplayName(languageName, inLanguageName)).toBe(expected);
  });

  // A language a later version of the data package adds, before its tag is written down: the package's own English
  // Word for it is also the word a person types, so the fallback is always something they recognise
  test.each([
    ["Klingon", DEFAULT_LANGUAGE],
    [DEFAULT_LANGUAGE, "Klingon"],
  ])("falls back to the package's word when %s or %s has no tag", (languageName, inLanguageName) => {
    expect.hasAssertions();

    expect(getLanguageDisplayName(languageName, inLanguageName)).toBe(languageName);
  });
});
