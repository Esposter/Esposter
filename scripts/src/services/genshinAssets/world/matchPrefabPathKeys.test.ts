import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { getAssetPathKey } from "#src/services/genshinAssets/shared/getAssetPathKey";
import { matchPrefabPathKeys } from "#src/services/genshinAssets/world/matchPrefabPathKeys";
import { describe, expect, test } from "vitest";

describe(matchPrefabPathKeys, () => {
  test("names a key by the candidate path of a name that hashes to it, and leaves the others out", () => {
    expect.hasAssertions();

    const path = "ART/Stages/Area/Nt/Build/YLL/Area_Nt_Build_YLL_Louti_E_03_Vo";
    const key = getAssetPathKey(path, AssetType.GameObject);

    expect(matchPrefabPathKeys(["Area_Nt_Build_YLL_Louti_E_03_Col"], new Set(["1", key]))).toStrictEqual(
      new Map([[key, path]]),
    );
  });
});
