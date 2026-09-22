import { getCanonicalLanguage } from "#src/services/getCanonicalLanguage";
import { describe, expect, test } from "vitest";

describe(getCanonicalLanguage, () => {
  const languageNames = ["English", "Japanese", "ChineseSimplified"];

  // The verbs print each language in its own words as well as the package's, so both are typeable
  test.each(["Japanese", "japanese", "JAPANESE", "jApAnEsE", "日本語"])(
    "%j answers the spelling the data package uses",
    (name) => {
      expect.hasAssertions();

      expect(getCanonicalLanguage(languageNames, name)).toBe("Japanese");
    },
  );

  // A code is not a name: the interface language speaks the data package's vocabulary and the dub speaks ISO, so
  // Nothing here silently accepts the other's spelling
  test.each(["", "ja", " "])("%j names none of them", (name) => {
    expect.hasAssertions();

    expect(getCanonicalLanguage(languageNames, name)).toBeUndefined();
  });
});
