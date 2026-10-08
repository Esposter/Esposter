import { checkIsArchitectureName } from "#src/services/genshinAssets/world/checkIsArchitectureName";
import { describe, expect, test } from "vitest";

describe(checkIsArchitectureName, () => {
  test("names the building families, and not their props, plants, effects or decals", () => {
    expect.hasAssertions();

    expect(
      [
        "Stages_Build_BeaconTower01",
        "Area_Ly_Build_LYG_MT_Stairs_02",
        "Area_MdBuild_Window57_Vo",
        "Area_MdProps_Flower03_Vo",
        "Area_MdProps_GraveWall_A_Vo",
        "Property_Build_Windmill01_Blade_Col",
        "Area_Ly_Build_HZ_HotelTree_Col",
        "Eff_Build_Hili_House_10_Destory",
        "Level_Common_Build_Root_RcvDecal_05_Col",
      ].map((name) => checkIsArchitectureName(name)),
    ).toStrictEqual([true, true, true, false, false, false, false, false, false]);
  });
});
