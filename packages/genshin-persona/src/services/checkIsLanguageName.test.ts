import { checkIsLanguageName } from "#src/services/checkIsLanguageName";
import { describe, expect, test } from "vitest";

describe(checkIsLanguageName, () => {
  test.each(["English", "Japanese", "ChineseSimplified"])("%j is a name", (name) => {
    expect.hasAssertions();

    expect(checkIsLanguageName(name)).toBe(true);
  });

  // The name reaches a file path in the roster cache, so a state file holding anything but a name is not read
  test.each(["", " ", "../../escaped", "ja-JP", "Japanese 2"])("%j is not one", (name) => {
    expect.hasAssertions();

    expect(checkIsLanguageName(name)).toBe(false);
  });
});
