import type { ExcelAvatarPromoteRow } from "#src/models/genshinAssets/stats/ExcelAvatarPromoteRow";
import type { ExcelFetterInfoRow } from "#src/models/genshinAssets/stats/ExcelFetterInfoRow";
import type { CharacterData } from "genshin-world";

import {
  AssociationRegionIdMap,
  ElementNameSet,
  EMPTY_ITEM_ID,
  QualityTypeRarityMap,
} from "#src/services/genshinAssets/stats/constants";
import { readPlayableAvatarRows } from "#src/services/genshinAssets/stats/readPlayableAvatarRows";
import { readSkillDepotMap } from "#src/services/genshinAssets/stats/readSkillDepotMap";
import { readSkillMap } from "#src/services/genshinAssets/stats/readSkillMap";
import { toAttributeLines } from "#src/services/genshinAssets/stats/toAttributeLines";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { Attribute, characterDataSchema } from "genshin-world";

// Every playable character as the roster holds it: its name by text id, its element from its burst's energy, its region
// From its association, its growth, its ascension phases from its promotion table, and what its every level starts with
export const getCharacterDatas = (notes: string[]): CharacterData[] => {
  const promoteIdRowsMap = Map.groupBy(
    readExcelTable<ExcelAvatarPromoteRow>("AvatarPromoteExcelConfigData"),
    ({ avatarPromoteId }) => avatarPromoteId,
  );
  const skillDepotMap = readSkillDepotMap();
  const skillMap = readSkillMap();
  const avatarIdAssociationMap = new Map(
    readExcelTable<ExcelFetterInfoRow>("FetterInfoExcelConfigData").map(({ avatarAssocType, avatarId }) => [
      avatarId,
      avatarAssocType,
    ]),
  );
  return readPlayableAvatarRows().map((row) => {
    const energySkill = skillDepotMap.get(row.skillDepotId)?.energySkill ?? 0;
    const costElemType = energySkill === 0 ? undefined : skillMap.get(energySkill)?.costElemType;
    const association = avatarIdAssociationMap.get(row.id);
    const promoteRows = (promoteIdRowsMap.get(row.avatarPromoteId) ?? []).toSorted(
      (firstRow, secondRow) => firstRow.promoteLevel - secondRow.promoteLevel,
    );
    const baseMap: Record<string, number> = {
      [Attribute.BaseAttack]: row.attackBase,
      [Attribute.BaseDefense]: row.defenseBase,
      [Attribute.BaseHealth]: row.hpBase,
    };
    return characterDataSchema.parse({
      ascensionPhases: promoteRows.map(({ addProps, costItems, requiredPlayerLevel, scoinCost, unlockMaxLevel }) => ({
        attributeLines: toAttributeLines(addProps, notes),
        coinCost: scoinCost,
        costItems: costItems.filter(({ id }) => id !== EMPTY_ITEM_ID).map(({ count, id }) => ({ count, id })),
        maxLevel: unlockMaxLevel,
        requiredPlayerLevel,
      })),
      attributeLines: [
        { attribute: Attribute.CriticalRate, value: row.critical },
        { attribute: Attribute.CriticalDamage, value: row.criticalHurt },
        { attribute: Attribute.EnergyRecharge, value: row.chargeEfficiency },
      ],
      bodyType: row.bodyType,
      element: costElemType && ElementNameSet.has(costElemType) ? costElemType : undefined,
      growAttributes: row.propGrowCurves.map(({ growCurve, type }) => ({
        attribute: type,
        base: baseMap[type],
        curve: growCurve,
      })),
      id: row.id,
      initialWeaponId: row.initialWeapon,
      nameTextId: String(row.nameTextMapHash),
      rarity: QualityTypeRarityMap[row.qualityType],
      regionId: association === undefined ? undefined : AssociationRegionIdMap[association],
      weaponType: row.weaponType,
    });
  });
};
