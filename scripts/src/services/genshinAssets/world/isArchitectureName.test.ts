import { isArchitectureName } from "#src/services/genshinAssets/world/isArchitectureName";
import { describe, expect, test } from "vitest";

describe(isArchitectureName, () => {
  test("names the building families, and not their props, plants, effects or decals", () => {
    expect.hasAssertions();

    expect(
      [
        "Stages_Build_BeaconTower01",
        "Area_Ly_Build_LYG_MT_Stairs_02",
        "Area_MdProps_Flower03_Vo",
        "Property_Build_Windmill01_Blade_Col",
        "Area_Ly_Build_HZ_HotelTree_Col",
        "Eff_Build_Hili_House_10_Destory",
        "Level_Common_Build_Root_RcvDecal_05_Col",
      ].map(isArchitectureName),
    ).toStrictEqual([true, true, false, false, false, false, false]);
  });
});
