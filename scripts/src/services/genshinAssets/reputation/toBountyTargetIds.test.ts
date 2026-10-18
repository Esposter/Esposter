import { toBountyTargetIds } from "#src/services/genshinAssets/reputation/toBountyTargetIds";
import { describe, expect, test } from "vitest";

describe(toBountyTargetIds, () => {
  const MONSTERS = [
    { id: 30, name: "Sample Guard" },
    { id: 11, name: "Cryo Sample Mage" },
    { id: 10, name: "Pyro Sample Mage" },
    { id: 31, name: "Sample Guard" },
  ];

  test("a name resolves to the lowest id of the monster it names, or of the family's first variant", () => {
    expect.hasAssertions();

    expect(toBountyTargetIds(["Sample Guard", "Sample Mage"], MONSTERS)).toStrictEqual([30, 10]);
  });

  test("a name no monster bears throws", () => {
    expect.hasAssertions();

    expect(() => toBountyTargetIds(["Unknown Creature"], MONSTERS)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: Unknown Creature, is the name of no monster]`,
    );
  });
});
