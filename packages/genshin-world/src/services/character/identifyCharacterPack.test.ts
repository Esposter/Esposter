import { identifyCharacterPack } from "#src/services/character/identifyCharacterPack";
import { describe, expect, test } from "vitest";

describe(identifyCharacterPack, () => {
  const characterIdNamesMap = new Map([
    [1, ["A"]],
    [2, ["B"]],
    [3, ["B"]],
  ]);

  // Zhongli's release names its models "ZhongLi" and "skill", and the game names him "Zhongli"
  test("identifies a release by its model's name in any case and spacing", () => {
    expect.hasAssertions();
    expect(identifyCharacterPack(["", " a "], [], characterIdNamesMap, 2)).toBe(1);
  });

  test("identifies a release by its folders' names where no model's name matches", () => {
    expect.hasAssertions();
    expect(identifyCharacterPack([""], ["", "a"], characterIdNamesMap, 2)).toBe(1);
  });

  test("keeps the picked character where a name matches it among others", () => {
    expect.hasAssertions();
    expect(identifyCharacterPack(["b"], [], characterIdNamesMap, 3)).toBe(3);
  });

  // The Traveler's release names its model "女主角", "protagonist", which is no character's name
  test.each([
    ["matches no character", [""]],
    ["matches several characters", ["b"]],
  ])("keeps the picked character where a name %s", (_title, modelNames) => {
    expect.hasAssertions();
    expect(identifyCharacterPack(modelNames, [], characterIdNamesMap, 1)).toBe(1);
  });
});
