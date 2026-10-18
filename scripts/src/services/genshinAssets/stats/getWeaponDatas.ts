import type { ExcelEquipAffixRow } from "#src/models/genshinAssets/stats/ExcelEquipAffixRow";
import type { ExcelWeaponPromoteRow } from "#src/models/genshinAssets/stats/ExcelWeaponPromoteRow";
import type { ExcelWeaponRow } from "#src/models/genshinAssets/stats/ExcelWeaponRow";
import type { WeaponData } from "genshin-world";

import {
  DEFAULT_DESTROY_RULE,
  EMPTY_ITEM_ID,
  EMPTY_PROPERTY_TYPE,
  WeaponTypeNameSet,
} from "#src/services/genshinAssets/stats/constants";
import { toAttributeLines } from "#src/services/genshinAssets/stats/toAttributeLines";
import { toWeaponPassive } from "#src/services/genshinAssets/stats/toWeaponPassive";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { takeOne } from "@esposter/shared";
import { weaponDataSchema } from "genshin-world";

// Every weapon with ascension phases as the game's tables hold it: its name by text id, its base ATK and secondary
// Attribute growing along their curves, its phases from its promotion table with what entering each costs, its fodder
// EXP, the Mora and material each refinement rank takes, what its destroy gives back, and its passive from its skill
// Affix
export const getWeaponDatas = (notes: string[]): WeaponData[] => {
  const promoteIdRowsMap = Map.groupBy(
    readExcelTable<ExcelWeaponPromoteRow>("WeaponPromoteExcelConfigData"),
    ({ weaponPromoteId }) => weaponPromoteId,
  );
  const affixIdRowsMap = Map.groupBy(readExcelTable<ExcelEquipAffixRow>("EquipAffixExcelConfigData"), ({ id }) => id);
  return readExcelTable<ExcelWeaponRow>("WeaponExcelConfigData").flatMap((row) => {
    const promoteRows = promoteIdRowsMap.get(row.weaponPromoteId);
    if (!promoteRows) return [];
    if (!WeaponTypeNameSet.has(row.weaponType)) {
      notes.push(`weapon ${row.id} is a ${row.weaponType}, a kind the open world gives no one, so it is left out`);
      return [];
    }
    const passive = toWeaponPassive(affixIdRowsMap.get(takeOne(row.skillAffix, 0)) ?? [], notes);
    return [
      weaponDataSchema.parse({
        ascensionPhases: promoteRows
          .toSorted((firstRow, secondRow) => firstRow.promoteLevel - secondRow.promoteLevel)
          .map(({ addProps, coinCost, costItems, requiredPlayerLevel, unlockMaxLevel }) => ({
            attributeLines: toAttributeLines(addProps, notes),
            coinCost,
            costItems: costItems.filter(({ id }) => id !== EMPTY_ITEM_ID).map(({ count, id }) => ({ count, id })),
            maxLevel: unlockMaxLevel,
            requiredPlayerLevel,
          })),
        baseExp: row.weaponBaseExp,
        destroyReturnMaterial: takeOne(row.destroyReturnMaterial, 0),
        destroyReturnMaterialCount: takeOne(row.destroyReturnMaterialCount, 0),
        destroyRule: row.destroyRule ?? DEFAULT_DESTROY_RULE,
        growAttributes: row.weaponProp.flatMap(({ initValue, propType = EMPTY_PROPERTY_TYPE, type }) =>
          propType === EMPTY_PROPERTY_TYPE ? [] : [{ attribute: propType, base: initValue, curve: type }],
        ),
        id: row.id,
        ...passive,
        nameTextId: String(row.nameTextMapHash),
        rarity: row.rankLevel,
        refinementCosts: row.awakenCosts,
        refinementMaterialId: row.awakenMaterial,
        weaponType: row.weaponType,
      }),
    ];
  });
};
