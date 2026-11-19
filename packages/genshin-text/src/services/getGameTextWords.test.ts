import { getGameTextWords } from "#src/services/getGameTextWords";
import { describe, expect, test } from "vitest";

describe(getGameTextWords, () => {
  test.each([
    ["Moonfins Caught: #1#", "Moonfins Caught"],
    ["Ideal Tension Zone maintained for: #1# second(s)", "Ideal Tension Zone maintained for"],
    ["Catch Moonfins", "Catch Moonfins"],
  ])("shows only the words of %s before its count", (text, words) => {
    expect.hasAssertions();

    expect(getGameTextWords(text)).toBe(words);
  });
});
