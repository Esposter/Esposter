import { getCanonicalLanguage } from "#src/services/getCanonicalLanguage";
import { describe, expect, test } from "vitest";

describe(getCanonicalLanguage, () => {
  const languageNames = ["English", "Japanese", "ChineseSimplified"];

  test.each(["Japanese", "japanese", "JAPANESE", "jApAnEsE"])(
    "%j answers the spelling the data package uses",
    (name) => {
      expect.hasAssertions();

      expect(getCanonicalLanguage(languageNames, name)).toBe("Japanese");
    },
  );

  // A code is not a name: the interface language speaks the data package's vocabulary and the dub speaks ISO, so
  // Nothing here silently accepts the other's spelling
  test.each(["", "ja", "Klingon"])("%j names none of them", (name) => {
    expect.hasAssertions();

    expect(getCanonicalLanguage(languageNames, name)).toBeUndefined();
  });
});
