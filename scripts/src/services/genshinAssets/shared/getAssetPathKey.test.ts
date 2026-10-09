import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { getAssetPathKey } from "#src/services/genshinAssets/shared/getAssetPathKey";
import { describe, expect, test } from "vitest";

describe(getAssetPathKey, () => {
  test("keys a prefab's path the way the installed asset index does", () => {
    expect.hasAssertions();

    expect(getAssetPathKey("ART/Stages/Common/Rock/Stages_MDSRock15_Vo", AssetType.GameObject)).toBe("491619157371");
  });
});
