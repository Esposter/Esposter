import { getInterfaceGameText } from "#src/services/genshinText/getInterfaceGameText";
import { describe, expect, test } from "vitest";

describe(getInterfaceGameText, () => {
  test("keeps the colour tags, dropping every other tag", () => {
    expect.hasAssertions();

    expect(getInterfaceGameText("<color=#FC3>a</color><i>b</i>")).toBe("<color=#FC3>a</color>b");
  });

  // The game writes a line break as a backslash and an n, which the interface reads as the break itself
  test("reads the escaped line break as a line break", () => {
    expect.hasAssertions();

    expect(getInterfaceGameText(String.raw`a\nb`)).toBe("a\nb");
  });

  // A size tag sets the type size of its words, which the interface does not draw, so only the words are kept
  test("drops a size tag and keeps its words", () => {
    expect.hasAssertions();

    expect(getInterfaceGameText("<size=22>a</size>")).toBe("a");
  });
});
