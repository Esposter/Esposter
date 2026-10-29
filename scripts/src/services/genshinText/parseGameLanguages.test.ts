import { parseGameLanguages } from "#src/services/genshinText/parseGameLanguages";
import { GameLanguage } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(parseGameLanguages, () => {
  test("each tag names its language, in the order the tags are given", () => {
    expect.hasAssertions();

    expect(parseGameLanguages(["ja", " en "])).toStrictEqual([GameLanguage.Japanese, GameLanguage.English]);
  });

  test("a tag that names no language throws", () => {
    expect.hasAssertions();

    expect(() => parseGameLanguages(["xx"])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: xx, is not the tag of a language the game is written in]`,
    );
  });
});
