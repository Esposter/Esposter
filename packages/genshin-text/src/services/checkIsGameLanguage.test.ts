import { GameLanguages } from "#src/models/GameLanguage";
import { checkIsGameLanguage } from "#src/services/checkIsGameLanguage";
import { describe, expect, test } from "vitest";

describe(checkIsGameLanguage, () => {
  test.each(GameLanguages)("%j is one", (name) => {
    expect.hasAssertions();

    expect(checkIsGameLanguage(name)).toBe(true);
  });

  // A language name reaches a file path in the persona's roster cache, so anything else is not one
  test.each(["", " ", "..", "ja-JP", "japanese"])("%j is not one", (name) => {
    expect.hasAssertions();

    expect(checkIsGameLanguage(name)).toBe(false);
  });
});
