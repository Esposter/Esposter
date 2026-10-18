import type { ExcelAvatarRow } from "#src/models/genshinAssets/stats/ExcelAvatarRow";

import { PLAYABLE_AVATAR_USE_TYPE } from "#src/services/genshinAssets/stats/constants";
import { readPlayableAvatarRows } from "#src/services/genshinAssets/stats/readPlayableAvatarRows";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { WeaponType } from "genshin-world";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinText/readExcelTable"), () => ({ readExcelTable: vi.fn<() => never[]>() }));

const createAvatarRow = (id: number, weaponType: string, useType?: string): ExcelAvatarRow => ({
  attackBase: 0,
  avatarPromoteId: 0,
  bodyType: "",
  candSkillDepotIds: [],
  chargeEfficiency: 0,
  critical: 0,
  criticalHurt: 0,
  defenseBase: 0,
  hpBase: 0,
  id,
  initialWeapon: 0,
  nameTextMapHash: 0,
  propGrowCurves: [],
  qualityType: "",
  skillDepotId: 0,
  useType,
  weaponType,
});

describe(readPlayableAvatarRows, () => {
  test("keeps the formal characters of the five weapon kinds only", () => {
    expect.hasAssertions();

    vi.mocked(readExcelTable).mockReturnValue([
      createAvatarRow(1, WeaponType.Sword, PLAYABLE_AVATAR_USE_TYPE),
      createAvatarRow(2, "WEAPON_CROSSBOW", PLAYABLE_AVATAR_USE_TYPE),
      createAvatarRow(3, WeaponType.Bow),
    ]);

    expect(readPlayableAvatarRows().map(({ id }) => id)).toStrictEqual([1]);
  });
});
