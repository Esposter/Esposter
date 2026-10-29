import type { ExcelTowerBuffRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerBuffRow";

import { TowerBuffIcon } from "#src/models/genshinAssets/spiralAbyss/TowerBuffIcon";
import { TowerBuffLastingType } from "#src/models/genshinAssets/spiralAbyss/TowerBuffLastingType";
import { TOWER_BUFF_TEXT_HASH_OFFSET } from "#src/services/genshinAssets/spiralAbyss/constants";
import { toAbyssTowerBuffs } from "#src/services/genshinAssets/spiralAbyss/toAbyssTowerBuffs";
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

  test("each Benediction is keyed by its id and holds its description under the text map key its hash is offset to", () => {
    expect.hasAssertions();

    expect(toAbyssTowerBuffs([createRow(TowerBuffIcon.Attack, TowerBuffLastingType.Floor)])).toStrictEqual(
      new Map([
        [
          TOWER_BUFF_ID,
          {
            descriptionTextHash: DESCRIPTION_TEXT_MAP_HASH + TOWER_BUFF_TEXT_HASH_OFFSET,
            icon: "sword",
            scope: "floor",
          },
        ],
      ]),
    );
  });

  test.each([
    [TowerBuffIcon.Attack, "sword"],
    [TowerBuffIcon.Defense, "shield"],
  ])("a %s icon draws the %s glyph", (buffIcon, icon) => {
    expect.hasAssertions();

    expect(toAbyssTowerBuffs([createRow(buffIcon, TowerBuffLastingType.Floor)]).get(TOWER_BUFF_ID)?.icon).toBe(icon);
  });

  test.each([
    [TowerBuffLastingType.Floor, "floor"],
    [TowerBuffLastingType.Level, "chamber"],
  ])("a %s lasting type spans the %s", (lastingType, scope) => {
    expect.hasAssertions();

    expect(toAbyssTowerBuffs([createRow(TowerBuffIcon.Attack, lastingType)]).get(TOWER_BUFF_ID)?.scope).toBe(scope);
  });

  test("a Life icon and an immediate lasting type publish neither field, rather than one written as undefined", () => {
    expect.hasAssertions();

    const rows = [createRow(TowerBuffIcon.Life, TowerBuffLastingType.Immediate)];
    const towerBuff = toAbyssTowerBuffs(rows).get(TOWER_BUFF_ID);

    expect(towerBuff).toStrictEqual({ descriptionTextHash: DESCRIPTION_TEXT_MAP_HASH + TOWER_BUFF_TEXT_HASH_OFFSET });
  });
});
