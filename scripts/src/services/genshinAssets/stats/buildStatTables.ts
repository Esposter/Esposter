import type { ExcelAvatarLevelRow } from "#src/models/genshinAssets/stats/ExcelAvatarLevelRow";
import type { ExcelCurveRow } from "#src/models/genshinAssets/stats/ExcelCurveRow";
import type { ExcelProudSkillRow } from "#src/models/genshinAssets/stats/ExcelProudSkillRow";
import type { ExcelWeaponLevelRow } from "#src/models/genshinAssets/stats/ExcelWeaponLevelRow";
import type { GameDataPublication } from "#src/models/shared/GameDataPublication";

import {
  ARTIFACT_EXP_ITEM_USE,
  AVATAR_LEVEL_TABLE_NAME,
  CHARACTER_EXP_ITEM_USE,
  WEAPON_EXP_ITEM_USE,
} from "#src/services/genshinAssets/stats/constants";
import { getArtifactMainAffixCurves } from "#src/services/genshinAssets/stats/getArtifactMainAffixCurves";
import { getArtifactMainAffixPools } from "#src/services/genshinAssets/stats/getArtifactMainAffixPools";
import { getArtifactRarityDatas } from "#src/services/genshinAssets/stats/getArtifactRarityDatas";
import { getArtifactSetDatas } from "#src/services/genshinAssets/stats/getArtifactSetDatas";
import { getCharacterConstellationKits } from "#src/services/genshinAssets/stats/getCharacterConstellationKits";
import { getCharacterDatas } from "#src/services/genshinAssets/stats/getCharacterDatas";
import { getCharacterSkillKits } from "#src/services/genshinAssets/stats/getCharacterSkillKits";
import { getCharacterTalentKits } from "#src/services/genshinAssets/stats/getCharacterTalentKits";
import { compareExperienceDescending, getExpMaterials } from "#src/services/genshinAssets/stats/getExpMaterials";
import { getMasterlessLevelLifts } from "#src/services/genshinAssets/stats/getMasterlessLevelLifts";
import { getWeaponDatas } from "#src/services/genshinAssets/stats/getWeaponDatas";
import { toCharacterExpToNext } from "#src/services/genshinAssets/stats/toCharacterExpToNext";
import { toGrowCurves } from "#src/services/genshinAssets/stats/toGrowCurves";
import { toTalentTables } from "#src/services/genshinAssets/stats/toTalentTables";
import { toTalentUpgradeMap } from "#src/services/genshinAssets/stats/toTalentUpgradeMap";
import { toWeaponLevelRequiredExps } from "#src/services/genshinAssets/stats/toWeaponLevelRequiredExps";
import { writeTalentTables } from "#src/services/genshinAssets/stats/writeTalentTables";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The roster, each character's skill sets, the weapons and the artifacts' tables, read from the dump's game tables, with
// The curves they grow along, only those any of them names. Every table is checked against the World's schema as it is
// Built, and each character's talent tables become entries of the talent indexes. What the run noted, a property no
// Attribute names among it, is returned once each
export const buildStatTables = (): { notes: string[]; publication: GameDataPublication } => {
  const notes: string[] = [];
  const characterDatas = getCharacterDatas(notes);
  const weaponDatas = getWeaponDatas(notes);
  const proudSkillRows = readExcelTable<ExcelProudSkillRow>("ProudSkillExcelConfigData");
  const characterTalentKits = getCharacterTalentKits(proudSkillRows);
  const combatGroupIds = new Set(characterTalentKits.flatMap(({ talentGroupIds }) => Object.values(talentGroupIds)));
  const talentTables = characterTalentKits.map(({ characterId, talentGroupIds }) => ({
    characterId,
    ...toTalentTables(proudSkillRows, new Set(Object.values(talentGroupIds))),
  }));
  const tableMap = {
    artifactExpMaterials: getExpMaterials(ARTIFACT_EXP_ITEM_USE),
    artifactMainAffixCurves: getArtifactMainAffixCurves(notes),
    artifactMainAffixPools: getArtifactMainAffixPools(),
    artifactRarities: getArtifactRarityDatas(),
    artifactSets: getArtifactSetDatas(notes),
    characterConstellationKits: getCharacterConstellationKits(notes),
    characterExpMaterials: getExpMaterials(CHARACTER_EXP_ITEM_USE).toSorted(compareExperienceDescending),
    characterExpToNext: toCharacterExpToNext(readExcelTable<ExcelAvatarLevelRow>(AVATAR_LEVEL_TABLE_NAME)),
    characterGrowCurves: toGrowCurves(
      readExcelTable<ExcelCurveRow>("AvatarCurveExcelConfigData"),
      new Set(characterDatas.flatMap(({ growAttributes }) => growAttributes.map(({ curve }) => curve))),
    ),
    characters: characterDatas,
    characterSkillKits: getCharacterSkillKits(),
    characterTalentKits,
    masterlessLevelLifts: getMasterlessLevelLifts(),
    talentUpgrades: toTalentUpgradeMap(proudSkillRows, combatGroupIds),
    weaponEnhancementOres: getExpMaterials(WEAPON_EXP_ITEM_USE).toSorted(compareExperienceDescending),
    weaponGrowCurves: toGrowCurves(
      readExcelTable<ExcelCurveRow>("WeaponCurveExcelConfigData"),
      new Set(weaponDatas.flatMap(({ growAttributes }) => growAttributes.map(({ curve }) => curve))),
    ),
    weaponLevelRequiredExps: toWeaponLevelRequiredExps(
      readExcelTable<ExcelWeaponLevelRow>("WeaponLevelExcelConfigData"),
    ),
    weapons: weaponDatas,
  };
  return {
    notes: [...new Set(notes)],
    publication: {
      indexes: writeTalentTables(talentTables),
      objects: Object.fromEntries(
        Object.entries(tableMap).map(([stem, table]) => [`${GameDataset.Stats}/${stem}`, table]),
      ),
    },
  };
};
