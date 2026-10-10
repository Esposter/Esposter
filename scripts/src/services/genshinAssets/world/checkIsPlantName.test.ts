import { checkIsPlantName } from "#src/services/genshinAssets/world/checkIsPlantName";
import { describe, expect, test } from "vitest";

describe(checkIsPlantName, () => {
  test("names the plant families, and not their effects, drops or flowerpots", () => {
    expect.hasAssertions();

    expect(
      [
        "Stages_Unique_CyTree01_Lod1",
        "Area_Md_Bush_01_Vo",
        "Eff_Plant_Leaf_Fall",
        "Item_Drop_Plant",
        "Area_MdProps_Flowerpot02",
        "Area_MdProps_FlowerPot02",
        "Area_Common_Build_Ruin_H_06_Vo",
      ].map((name) => checkIsPlantName(name)),
    ).toStrictEqual([true, true, false, false, false, false, false]);
  });
});
