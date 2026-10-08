import type { ExcelCurveRow } from "#src/models/genshinAssets/stats/ExcelCurveRow";

import { STATS_GENERATED_DIRECTORY } from "#src/services/genshinAssets/stats/constants";
import { getArtifactMainAffixCurves } from "#src/services/genshinAssets/stats/getArtifactMainAffixCurves";
import { getArtifactSetDatas } from "#src/services/genshinAssets/stats/getArtifactSetDatas";
import { getCharacterDatas } from "#src/services/genshinAssets/stats/getCharacterDatas";
import { getWeaponDatas } from "#src/services/genshinAssets/stats/getWeaponDatas";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { toGrowCurves } from "#src/services/genshinAssets/stats/toGrowCurves";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const toJson = (value: unknown): string => `${JSON.stringify(value, undefined, 2)}\n`;
// The roster, the weapons and the artifacts' tables, read from the dump's game tables into the world package, with the
// Curves they grow along, only those any of them names. Every table is checked against the world's schema as it is
// Written; what the run noted, a property no attribute names among it, is returned once each
export const writeStatTables = (): string[] => {
  const notes: string[] = [];
  const characterDatas = getCharacterDatas(notes);
  const weaponDatas = getWeaponDatas(notes);
  const tableMap = {
    "artifactMainAffixCurves.json": getArtifactMainAffixCurves(notes),
    "artifactSets.json": getArtifactSetDatas(notes),
    "characterGrowCurves.json": toGrowCurves(
      readExcelTable<ExcelCurveRow>("AvatarCurveExcelConfigData"),
      new Set(characterDatas.flatMap(({ growAttributes }) => growAttributes.map(({ curve }) => curve))),
    ),
    "characters.json": characterDatas,
    "weaponGrowCurves.json": toGrowCurves(
      readExcelTable<ExcelCurveRow>("WeaponCurveExcelConfigData"),
      new Set(weaponDatas.flatMap(({ growAttributes }) => growAttributes.map(({ curve }) => curve))),
    ),
    "weapons.json": weaponDatas,
  };
  rmSync(STATS_GENERATED_DIRECTORY, { force: true, recursive: true });
  mkdirSync(STATS_GENERATED_DIRECTORY, { recursive: true });
  for (const [fileName, table] of Object.entries(tableMap))
    writeFileSync(join(STATS_GENERATED_DIRECTORY, fileName), toJson(table));
  return [...new Set(notes)];
};
