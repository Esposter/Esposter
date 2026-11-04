import { compareSurveyLogicTexts } from "#src/services/shared/compareSurveyLogicTexts";
import { describe, expect, test } from "vitest";

describe(compareSurveyLogicTexts, () => {
  test.each<[string, string, string, number]>([
    ["orders a text before a longer text it starts", "a", "ab", -1],
    ["orders a longer text after a text it starts", "ab", "a", 1],
    ["orders equal texts equal", "ab", "ab", 0],
    ["orders the empty text before any text", "", "a", -1],
    ["orders an uppercase letter before a lowercase one by code point", "B", "a", -1],
    ["orders a character past the basic plane after one inside it", "\u{1F600}", "\uFFFD", 1],
    ["orders a character past the basic plane after a character above the surrogates", "\u{10000}", "\uE000", 1],
    ["orders two characters past the basic plane by their own code points", "\u{1F600}", "\u{1F601}", -1],
    ["orders the characters after a shared character past the basic plane", "\u{1F600}a", "\u{1F600}b", -1],
  ])("%s", (_title, first, second, expected) => {
    expect.hasAssertions();

    expect(compareSurveyLogicTexts(first, second)).toBe(expected);
  });
});
