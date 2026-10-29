import { isShownGameText } from "#src/services/genshinText/isShownGameText";
import { describe, expect, test } from "vitest";

describe(isShownGameText, () => {
  test.each([
    ["Corridor", "Corridor", true, true],
    ["Corridor", "corridor", false, true],
    ["Corridor", "corridor", true, false],
    ["<color=#FFD780FF>Corridor</color>", "Corridor", true, true],
    ["#Corridor", "Corridor", true, true],
    ["Level {0}", "Level 5", false, false],
  ])("%j against %j, exact %j, is %j", (text, shownText, isExact, expected) => {
    expect.hasAssertions();

    expect(isShownGameText(text, shownText, isExact)).toBe(expected);
  });
});
