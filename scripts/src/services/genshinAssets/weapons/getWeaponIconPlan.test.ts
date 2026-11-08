import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { getWeaponIconPlan } from "#src/services/genshinAssets/weapons/getWeaponIconPlan";
import { describe, expect, test } from "vitest";

describe(getWeaponIconPlan, () => {
  const BLOCK = "00/14691532.blk";
  const HELD_NAME = "UI_EquipIcon_Sword_Blunt";
  const MISSING_NAME = "UI_EquipIcon_Sword_Silver";

  test("a weapon icon the index does not name is reported, not skipped", () => {
    expect.hasAssertions();

    const { blockNamesMap, missingNames } = getWeaponIconPlan(
      [HELD_NAME, MISSING_NAME],
      [{ block: BLOCK, name: HELD_NAME, offset: 0, pathId: "7150199236348243771", type: AssetType.Texture2D }],
    );

    expect(missingNames).toStrictEqual([MISSING_NAME]);
    expect(blockNamesMap.get(BLOCK)).toStrictEqual([HELD_NAME]);
    expect([...blockNamesMap.values()].flat()).not.toContain(MISSING_NAME);
  });
});
