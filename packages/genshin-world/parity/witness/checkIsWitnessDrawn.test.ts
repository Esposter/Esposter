import { WitnessRole } from "#parity/models/witness/WitnessRole";
import { checkIsWitnessDrawn } from "#parity/witness/checkIsWitnessDrawn";
import { describe, expect, test } from "vitest";

describe(checkIsWitnessDrawn, () => {
  test.each([
    [
      "the exports' read draws a family group the view lists, though the scene hid it",
      false,
      WitnessRole.Export,
      ["Door"],
      true,
    ],
    ["the exports' read draws no family group the view leaves out", false, WitnessRole.Export, ["Towers"], false],
    ["the exports' read draws none of our pieces", false, WitnessRole.Ours, ["Door"], false],
    ["the exports' read draws no copy riding an export", false, WitnessRole.RideCopy, ["Door"], false],
    ["the scene read draws our own pieces of a family", true, WitnessRole.Ours, [], true],
    ["the scene read draws no family group of the exports", true, WitnessRole.Export, ["Door"], false],
    [
      "the scene read draws no copy riding an export, though the view lists its family",
      true,
      WitnessRole.RideCopy,
      ["Door"],
      false,
    ],
  ])("%s", (_title, isScene, role, viewFamilies, expected) => {
    expect.hasAssertions();
    expect(checkIsWitnessDrawn({ family: "Door", isScene, role, viewFamilies })).toBe(expected);
  });
});
