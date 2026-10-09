import { getPrefabPathCandidates } from "#src/services/genshinAssets/world/getPrefabPathCandidates";
import { describe, expect, test } from "vitest";

describe(getPrefabPathCandidates, () => {
  test("places a prefab in its category folder, Common and each run of words after the category", () => {
    expect.hasAssertions();

    const stem = "Area_Nt_Build_YLL_Louti_E_03_Vo";

    expect(getPrefabPathCandidates(stem)).toStrictEqual([
      `ART/Stages/Area/Nt/Build/Common/${stem}`,
      `ART/Stages/Area/Nt/Build/${stem}`,
      `ART/Stages/Area/Nt/Build/YLL/${stem}`,
      `ART/Stages/Area/Nt/Build/YLL_Louti/${stem}`,
      `ART/Stages/Area/Nt/Build/YLL_Louti_E/${stem}`,
      `ART/Stages/Area/Nt/Build/YLL_Louti_E_03/${stem}`,
      `ART/Stages/Area/Nt/Build/YLL_Louti_E_03_Vo/${stem}`,
    ]);
  });

  test("names no folder for a stem outside the open world's roots", () => {
    expect.hasAssertions();

    expect(getPrefabPathCandidates("Stages_MDSRock11_Vo")).toStrictEqual([]);
  });
});
