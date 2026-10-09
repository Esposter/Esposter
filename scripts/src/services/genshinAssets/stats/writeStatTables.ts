import type { ExcelCurveRow } from "#src/models/genshinAssets/stats/ExcelCurveRow";
import type { ExcelProudSkillRow } from "#src/models/genshinAssets/stats/ExcelProudSkillRow";
import type { ExcelWeaponLevelRow } from "#src/models/genshinAssets/stats/ExcelWeaponLevelRow";

import { STATS_GENERATED_DIRECTORY } from "#src/services/genshinAssets/stats/constants";
import { getArtifactExpMaterials } from "#src/services/genshinAssets/stats/getArtifactExpMaterials";
import { getArtifactMainAffixCurves } from "#src/services/genshinAssets/stats/getArtifactMainAffixCurves";
import { getArtifactMainAffixPools } from "#src/services/genshinAssets/stats/getArtifactMainAffixPools";
import { getArtifactRarityDatas } from "#src/services/genshinAssets/stats/getArtifactRarityDatas";
import { getArtifactSetDatas } from "#src/services/genshinAssets/stats/getArtifactSetDatas";
import { getCharacterConstellationKits } from "#src/services/genshinAssets/stats/getCharacterConstellationKits";
import { getCharacterDatas } from "#src/services/genshinAssets/stats/getCharacterDatas";
import { getCharacterSkillKits } from "#src/services/genshinAssets/stats/getCharacterSkillKits";
import { getCharacterTalentKits } from "#src/services/genshinAssets/stats/getCharacterTalentKits";
import { getWeaponDatas } from "#src/services/genshinAssets/stats/getWeaponDatas";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { toGrowCurves } from "#src/services/genshinAssets/stats/toGrowCurves";
import { toTalentMultiplierMap } from "#src/services/genshinAssets/stats/toTalentMultiplierMap";
import { toTalentUpgradeMap } from "#src/services/genshinAssets/stats/toTalentUpgradeMap";
import { toWeaponLevelRequiredExps } from "#src/services/genshinAssets/stats/toWeaponLevelRequiredExps";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const toJson = (value: unknown): string => `${JSON.stringify(value, undefined, 2)}\n`;
// The roster, each character's skill sets, the weapons and the artifacts' tables, read from the dump's game tables into
// The world package, with the curves they grow along, only those any of them names. Every table is checked against the
// World's schema as it is written; what the run noted, a property no attribute names among it, is returned once each
export const writeStatTables = (): string[] => {
  const notes: string[] = [];
  const characterDatas = getCharacterDatas(notes);
  const weaponDatas = getWeaponDatas(notes);
  const characterTalentKits = getCharacterTalentKits();
  const proudSkillRows = readExcelTable<ExcelProudSkillRow>("ProudSkillExcelConfigData");
  const combatGroupIds = new Set(characterTalentKits.flatMap(({ talentGroupIds }) => Object.values(talentGroupIds)));
  const tableMap = {
    "artifactExpMaterials.json": getArtifactExpMaterials(),
    "artifactMainAffixCurves.json": getArtifactMainAffixCurves(notes),
    "artifactMainAffixPools.json": getArtifactMainAffixPools(),
    "artifactRarities.json": getArtifactRarityDatas(),
    "artifactSets.json": getArtifactSetDatas(notes),
    "characterConstellationKits.json": getCharacterConstellationKits(notes),
    "characterGrowCurves.json": toGrowCurves(
      readExcelTable<ExcelCurveRow>("AvatarCurveExcelConfigData"),
      new Set(characterDatas.flatMap(({ growAttributes }) => growAttributes.map(({ curve }) => curve))),
    ),
    "characters.json": characterDatas,
    "characterSkillKits.json": getCharacterSkillKits(),
    "characterTalentKits.json": characterTalentKits,
    "talentMultipliers.json": toTalentMultiplierMap(proudSkillRows, combatGroupIds),
    "talentUpgrades.json": toTalentUpgradeMap(proudSkillRows, combatGroupIds),
    "weaponGrowCurves.json": toGrowCurves(
      readExcelTable<ExcelCurveRow>("WeaponCurveExcelConfigData"),
      new Set(weaponDatas.flatMap(({ growAttributes }) => growAttributes.map(({ curve }) => curve))),
    ),
    "weaponLevelRequiredExps.json": toWeaponLevelRequiredExps(
      readExcelTable<ExcelWeaponLevelRow>("WeaponLevelExcelConfigData"),
    ),
    "weapons.json": weaponDatas,
  };
  rmSync(STATS_GENERATED_DIRECTORY, { force: true, recursive: true });
  mkdirSync(STATS_GENERATED_DIRECTORY, { recursive: true });
  for (const [fileName, table] of Object.entries(tableMap))
    writeFileSync(join(STATS_GENERATED_DIRECTORY, fileName), toJson(table));
  return [...new Set(notes)];
};
