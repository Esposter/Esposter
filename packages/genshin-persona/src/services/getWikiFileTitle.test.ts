import { VoiceLanguage } from "#src/models/VoiceLanguage";
import { getWikiFileTitle } from "#src/services/getWikiFileTitle";
import { describe, expect, test } from "vitest";

describe(getWikiFileTitle, () => {
  const stem = "stem";

  test("leaves the English dub unprefixed", () => {
    expect.hasAssertions();

    expect(getWikiFileTitle(stem, VoiceLanguage.English)).toBe("File:VO_stem.ogg");
  });

  test("prefixes every other dub", () => {
    expect.hasAssertions();

    expect(getWikiFileTitle(stem, VoiceLanguage.Japanese)).toBe("File:VO_JA_stem.ogg");
  });
});
