import { GameLanguage } from "#src/models/GameLanguage";
import { checkIsGameLanguage } from "#src/services/checkIsGameLanguage";
import { describe, expect, test } from "vitest";

describe(checkIsGameLanguage, () => {
  test("a game language is one", () => {
    expect.hasAssertions();

    expect(checkIsGameLanguage(GameLanguage.Japanese)).toBe(true);
  });

  // A language name reaches a file path in the persona's roster cache, so anything else is not one
  test.each(["", " ", "..", "ja-JP", "japanese"])("%j is not one", (name) => {
    expect.hasAssertions();

    expect(checkIsGameLanguage(name)).toBe(false);
  });
});
