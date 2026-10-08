import type { ExcelExploreAreaTotalRow } from "#src/models/genshinAssets/exploration/ExcelExploreAreaTotalRow";
import type { ExcelWorldAreaExploreEventRow } from "#src/models/genshinAssets/exploration/ExcelWorldAreaExploreEventRow";

import { EXPLORATION_GENERATED_DIRECTORY, MONDSTADT_EXPLORATION_PATH } from "#src/services/genshinAssets/exploration/constants";
import { ExploreAreaCatalogueIdMap } from "#src/services/genshinAssets/exploration/ExploreAreaCatalogueIdMap";
import { toExplorationDoing } from "#src/services/genshinAssets/exploration/toExplorationDoing";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync, writeFileSync } from "node:fs";

const toJson = (value: unknown): string => `${JSON.stringify(value, undefined, 2)}\n`;
// Mondstadt's exploration areas, each with its total and the doings its progress counts, written as one slice in the
// World's generated folder. An area the table gives no total is an error, since its progress would have no share
export const writeMondstadtExplorationAreas = (): void => {
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
      total: total.totalExp,
    };
  });
  mkdirSync(EXPLORATION_GENERATED_DIRECTORY, { recursive: true });
  writeFileSync(MONDSTADT_EXPLORATION_PATH, toJson(areas));
};
