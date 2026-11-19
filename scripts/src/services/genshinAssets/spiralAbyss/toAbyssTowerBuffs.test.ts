import type { ExcelTowerBuffRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerBuffRow";

import { TowerBuffIcon } from "#src/models/genshinAssets/spiralAbyss/TowerBuffIcon";
import { TowerBuffLastingType } from "#src/models/genshinAssets/spiralAbyss/TowerBuffLastingType";
import { toAbyssTowerBuffs } from "#src/services/genshinAssets/spiralAbyss/toAbyssTowerBuffs";
import { AbyssBenedictionIcon, AbyssBenedictionScope } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toAbyssTowerBuffs, () => {
  const TOWER_BUFF_ID = 1;
  const DESCRIPTION_TEXT_MAP_HASH = 2;
  const createRow = (buffIcon: TowerBuffIcon, lastingType: TowerBuffLastingType): ExcelTowerBuffRow => ({
    buffIcon,
    descTextMapHash: DESCRIPTION_TEXT_MAP_HASH,
    lastingType,
    towerBuffId: TOWER_BUFF_ID,
  });

  test("each Benediction is keyed by its id and holds its description's text hash", () => {
    expect.hasAssertions();

    expect(toAbyssTowerBuffs([createRow(TowerBuffIcon.Attack, TowerBuffLastingType.Floor)])).toStrictEqual(
      new Map([
        [
          TOWER_BUFF_ID,
          {
            descriptionTextHash: DESCRIPTION_TEXT_MAP_HASH,
            icon: AbyssBenedictionIcon.Sword,
            scope: AbyssBenedictionScope.Floor,
          },
        ],
      ]),
    );
  });

  test("a Life icon and an immediate lasting type publish neither field, rather than one written as undefined", () => {
    expect.hasAssertions();

    const rows = [createRow(TowerBuffIcon.Life, TowerBuffLastingType.Immediate)];
    const towerBuff = toAbyssTowerBuffs(rows).get(TOWER_BUFF_ID);

    expect(towerBuff).toStrictEqual({ descriptionTextHash: DESCRIPTION_TEXT_MAP_HASH });
  });
});
