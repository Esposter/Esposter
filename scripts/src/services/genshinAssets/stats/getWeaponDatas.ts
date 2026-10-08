import type { ExcelWeaponPromoteRow } from "#src/models/genshinAssets/stats/ExcelWeaponPromoteRow";
import type { ExcelWeaponRow } from "#src/models/genshinAssets/stats/ExcelWeaponRow";
import type { WeaponData } from "genshin-world";

import { EMPTY_PROPERTY_TYPE } from "#src/services/genshinAssets/stats/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { toAttributeLines } from "#src/services/genshinAssets/stats/toAttributeLines";
import { weaponDataSchema } from "genshin-world";

// Every weapon with ascension phases as the game's tables hold it: its base ATK and secondary attribute growing along
// Their curves, and its phases from its promotion table
export const getWeaponDatas = (notes: string[]): WeaponData[] => {
  const promoteIdRowsMap = Map.groupBy(
    readExcelTable<ExcelWeaponPromoteRow>("WeaponPromoteExcelConfigData"),
    ({ weaponPromoteId }) => weaponPromoteId,
  );
  return readExcelTable<ExcelWeaponRow>("WeaponExcelConfigData").flatMap((row) => {
    const promoteRows = promoteIdRowsMap.get(row.weaponPromoteId);
    if (!promoteRows) return [];
    return [
      weaponDataSchema.parse({
        ascensionPhases: promoteRows
          .toSorted((firstRow, secondRow) => (firstRow.promoteLevel ?? 0) - (secondRow.promoteLevel ?? 0))
          .map(({ addProps, unlockMaxLevel }) => ({
            attributeLines: toAttributeLines(addProps, notes),
            maxLevel: unlockMaxLevel,
          })),
        growAttributes: row.weaponProp
          .filter(({ propType }) => propType !== EMPTY_PROPERTY_TYPE)
          .map(({ initValue = 0, propType, type }) => ({ attribute: propType, base: initValue, curve: type })),
        id: row.id,
        rarity: row.rankLevel,
        weaponType: row.weaponType,
      }),
    ];
  });
};
