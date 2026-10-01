import { GameLanguage } from "#src/models/GameLanguage";
import { getCanonicalLanguage } from "#src/services/getCanonicalLanguage";
import { describe, expect, test } from "vitest";

describe(getCanonicalLanguage, () => {
  // A list of languages shows each in its own words as well as the English spelling, so both are typeable
  test.each(["Japanese", "japanese", "JAPANESE", "jApAnEsE", "日本語"])("%j is Japanese", (name) => {
    expect.hasAssertions();

    expect(getCanonicalLanguage(name)).toBe(GameLanguage.Japanese);
  });

  // A code is not a name: nothing here silently accepts a BCP-47 tag in place of the language's spelling
  test.each(["", "ja", " "])("%j names none of them", (name) => {
    expect.hasAssertions();

    expect(getCanonicalLanguage(name)).toBeUndefined();
  });
});
