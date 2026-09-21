import { CharacterColorMap } from "#src/services/CharacterColorMap";
import { readGenshinDb } from "#src/services/readGenshinDb";
import { describe, expect, test } from "vitest";

// The map is data, so what is checked is the two ways a row can be wrong without anything failing at runtime: a
// Key that reaches no character, which the element's colour would silently stand in for, and a value the
// Foreground escape cannot be built from, which would draw as garbage rather than as a colour
describe("characterColorMap", () => {
  test("names only characters the roster holds", () => {
    expect.hasAssertions();

    const names = new Set(readGenshinDb().characters("names", { matchCategories: true }));

    expect(Object.keys(CharacterColorMap).filter((name) => !names.has(name))).toStrictEqual([]);
  });

  test("holds a six-digit hex triplet in every row", () => {
    expect.hasAssertions();

    expect(Object.values(CharacterColorMap).filter((color) => !/^#[0-9a-f]{6}$/u.test(color))).toStrictEqual([]);
  });
});
