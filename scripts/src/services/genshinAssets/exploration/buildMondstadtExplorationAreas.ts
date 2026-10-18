import type { ExcelExploreAreaTotalRow } from "#src/models/genshinAssets/exploration/ExcelExploreAreaTotalRow";
import type { ExcelWorldAreaExploreEventRow } from "#src/models/genshinAssets/exploration/ExcelWorldAreaExploreEventRow";

import { ExploreAreaCatalogueIdMap } from "#src/services/genshinAssets/exploration/ExploreAreaCatalogueIdMap";
import { toExplorationDoing } from "#src/services/genshinAssets/exploration/toExplorationDoing";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// Mondstadt's exploration areas, each with its total, its reputation ratio and the doings its progress counts,
// Published as one record of the exploration dataset. An area the table gives no total is an error, since its progress
// Would have no share
export const buildMondstadtExplorationAreas = (): Record<string, unknown> => {
  const totals = readExcelTable<ExcelExploreAreaTotalRow>("ExploreAreaTotalExpExcelConfigData");
  const events = readExcelTable<ExcelWorldAreaExploreEventRow>("WorldAreaExploreEventConfigData");
  const areas = Object.entries(ExploreAreaCatalogueIdMap).map(([exploreAreaId, areaId]) => {
    const total = totals.find(({ areaID }) => String(areaID) === exploreAreaId);
    if (!total)
      throw new InvalidOperationError(
        Operation.Read,
        "exploration area",
        `area ${exploreAreaId} has no total in the table`,
      );
    return {
      areaId,
      doings: events
        .filter(({ AreaID }) => String(AreaID) === exploreAreaId)
        .flatMap((event) => {
          const doing = toExplorationDoing(event);
          return doing ? [doing] : [];
        }),
      reputationRatio: total.reputationRatio,
      total: total.totalExp,
    };
  });
  return { [`${GameDataset.Exploration}/mondstadt`]: areas };
};
