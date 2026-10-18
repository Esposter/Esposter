import { collectNameTextIds } from "#src/services/genshinText/collectNameTextIds";
import { describe, expect, test } from "vitest";

describe(collectNameTextIds, () => {
  test("should collect every name and description text id at any depth, and no other number", () => {
    expect.hasAssertions();

    const textIds = new Set<string>();
    collectNameTextIds(
      { blessing: { descriptionTextHash: 3, nameTextHash: 2 }, floors: [{ nested: { nameTextId: 1 } }], rowId: 4 },
      textIds,
    );

    expect([...textIds].toSorted()).toStrictEqual(["1", "2", "3"]);
  });

  test("should collect a weapon's passive name and each rank's description, and no empty passive name", () => {
    expect.hasAssertions();

    const textIds = new Set<string>();
    collectNameTextIds({ passiveNameTextId: "4", passiveRankDescriptionTextIds: ["5", "6"] }, textIds);
    collectNameTextIds({ passiveNameTextId: "", passiveRankDescriptionTextIds: [] }, textIds);

    expect([...textIds].toSorted()).toStrictEqual(["4", "5", "6"]);
  });
});
