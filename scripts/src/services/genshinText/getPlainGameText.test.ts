import { getPlainGameText } from "#src/services/genshinText/getPlainGameText";
import { describe, expect, test } from "vitest";

describe(getPlainGameText, () => {
  test.each([
    ["a", "a"],
    ["#a", "a"],
    [String.raw`a\nb`, "a\nb"],
    ["a{NON_BREAK_SPACE}b", "a b"],
    ["<color=#37FFFF>a:</color> b", "a: b"],
    ["<i>a</i>", "a"],
    ["<<i>i>a", "a"],
    ["{LAYOUT_PC#a}{LAYOUT_MOBILE#b}{LAYOUT_PS#c}", "a"],
    ["a{RUBY#[D]b}", "a"],
  ])("%j reads %j", (text, expected) => {
    expect.hasAssertions();

    expect(getPlainGameText(text)).toBe(expected);
  });

  // The game fills these per player, so the reader fills them and they pass through untouched
  test("keeps what the game fills per player", () => {
    expect.hasAssertions();

    const text = "{NICKNAME}{M#a}{F#b}";

    expect(getPlainGameText(`#${text}`)).toBe(text);
  });
});
