import type { ExcelAvatarPromoteRow } from "#src/models/genshinAssets/stats/ExcelAvatarPromoteRow";
import type { ExcelAvatarRow } from "#src/models/genshinAssets/stats/ExcelAvatarRow";
import type { ExcelFetterInfoRow } from "#src/models/genshinAssets/stats/ExcelFetterInfoRow";
import type { ExcelSkillDepotRow } from "#src/models/genshinAssets/stats/ExcelSkillDepotRow";
import type { ExcelSkillRow } from "#src/models/genshinAssets/stats/ExcelSkillRow";
import type { CharacterData } from "genshin-world";

import {
  AssociationRegionIdMap,
  PLAYABLE_AVATAR_USE_TYPE,
  QualityTypeRarityMap,
} from "#src/services/genshinAssets/stats/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { toAttributeLines } from "#src/services/genshinAssets/stats/toAttributeLines";
import { Attribute, characterDataSchema, Element } from "genshin-world";

// Every playable character as the roster holds it: its name by text id, its element from its burst's energy, its region
// From its association, its growth, its ascension phases from its promotion table, and what its every level starts with
export const getCharacterDatas = (notes: string[]): CharacterData[] => {
  const promoteIdRowsMap = Map.groupBy(
    readExcelTable<ExcelAvatarPromoteRow>("AvatarPromoteExcelConfigData"),
    ({ avatarPromoteId }) => avatarPromoteId,
  );
  const skillDepotMap = new Map(
    readExcelTable<ExcelSkillDepotRow>("AvatarSkillDepotExcelConfigData").map((row) => [row.id, row]),
  );
  const skillMap = new Map(readExcelTable<ExcelSkillRow>("AvatarSkillExcelConfigData").map((row) => [row.id, row]));
  const avatarIdAssociationMap = new Map(
    readExcelTable<ExcelFetterInfoRow>("FetterInfoExcelConfigData").map(({ avatarAssocType, avatarId }) => [
      avatarId,
      avatarAssocType,
    ]),
  );
  const elements = new Set<string>(Object.values(Element));
  return readExcelTable<ExcelAvatarRow>("AvatarExcelConfigData")
    .filter(({ useType }) => useType === PLAYABLE_AVATAR_USE_TYPE)
    .map((row) => {
      const energySkill = skillDepotMap.get(row.skillDepotId)?.energySkill;
      const costElemType = energySkill === undefined ? undefined : skillMap.get(energySkill)?.costElemType;
      const association = avatarIdAssociationMap.get(row.id);
      const promoteRows = (promoteIdRowsMap.get(row.avatarPromoteId) ?? []).toSorted(
        (firstRow, secondRow) => (firstRow.promoteLevel ?? 0) - (secondRow.promoteLevel ?? 0),
      );
      const baseMap: Record<string, number> = {
        [Attribute.BaseAttack]: row.attackBase,
        [Attribute.BaseDefense]: row.defenseBase,
        [Attribute.BaseHealth]: row.hpBase,
      };
      return characterDataSchema.parse({
        ascensionPhases: promoteRows.map(({ addProps, unlockMaxLevel }) => ({
          attributeLines: toAttributeLines(addProps, notes),
          maxLevel: unlockMaxLevel,
        })),
        attributeLines: [
          { attribute: Attribute.CriticalRate, value: row.critical },
          { attribute: Attribute.CriticalDamage, value: row.criticalHurt },
          { attribute: Attribute.EnergyRecharge, value: row.chargeEfficiency },
        ],
        bodyType: row.bodyType,
        element: costElemType && elements.has(costElemType) ? costElemType : undefined,
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
