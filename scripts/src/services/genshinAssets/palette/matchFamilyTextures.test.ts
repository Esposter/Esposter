import { matchFamilyTextures } from "#src/services/genshinAssets/palette/matchFamilyTextures";

import { describe, expect, test } from "vitest";

describe(matchFamilyTextures, () => {
  test("matches only the diffuse maps of the named families", () => {
    expect.hasAssertions();

    const fileNames = [
      "Area_MdBuild_House_Wall06_Diffuse.png",
      "Area_MdBuild_House_Wall06_Normal.png",
      "Area_MdBuild_House_Wall06_SMBE.png",
      "Area_MdBuild_Column01_Diffuse_Clamp.png",
      "Area_MdBuild_Column010_Diffuse.png",
      "Area_MdBuild_House_Wall06_Diffuse.txt",
    ];

    expect(matchFamilyTextures(fileNames, ["Area_MdBuild_House_Wall06", "Area_MdBuild_Column01"])).toStrictEqual([
      "Area_MdBuild_House_Wall06_Diffuse.png",
      "Area_MdBuild_Column01_Diffuse_Clamp.png",
    ]);
  });
});
