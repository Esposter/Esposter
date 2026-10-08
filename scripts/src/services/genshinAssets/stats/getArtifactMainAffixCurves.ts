import type { ExcelReliquaryLevelRow } from "#src/models/genshinAssets/stats/ExcelReliquaryLevelRow";
import type { ArtifactMainAffixCurve } from "genshin-world";

import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { toAttributeLines } from "#src/services/genshinAssets/stats/toAttributeLines";
import { getOrCreate, ID_SEPARATOR } from "@esposter/shared";
import { artifactMainAffixCurveSchema } from "genshin-world";

// What every main affix gives at each rarity, by enhancement level from +0, as the game's level table holds it
export const getArtifactMainAffixCurves = (notes: string[]): ArtifactMainAffixCurve[] => {
  const rows = readExcelTable<ExcelReliquaryLevelRow>("ReliquaryLevelExcelConfigData")
    .filter(({ rank = 0 }) => rank > 0)
    .toSorted((firstRow, secondRow) => firstRow.level - secondRow.level);
  const curveMap = new Map<string, ArtifactMainAffixCurve>();
  for (const { addProps, rank = 0 } of rows)
    for (const { attribute, value } of toAttributeLines(addProps, notes)) {
      const curve = getOrCreate(curveMap, `${rank}${ID_SEPARATOR}${attribute}`, () => ({
        attribute,
        rarity: rank,
        values: [],
      }));
      curve.values.push(value);
    }

  return Array.from(curveMap.values(), (curve) => artifactMainAffixCurveSchema.parse(curve));
};
