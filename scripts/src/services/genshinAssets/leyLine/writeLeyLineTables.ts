import type { ExcelBlossomGroupRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomGroupRow";
import type { ExcelBlossomRefreshRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomRefreshRow";
import type { ExcelBlossomSectionOrderRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomSectionOrderRow";

import { LEY_LINE_REGION_DIRECTORY } from "#src/services/genshinAssets/leyLine/constants";
import { toLeyLineRegions } from "#src/services/genshinAssets/leyLine/toLeyLineRegions";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

// The ley line outcrops the world reads, one region file per city with a ley line kind, from the dump's blossom refresh,
// Group and section order tables
export const writeLeyLineTables = (): void => {
  const regions = toLeyLineRegions(
    readExcelTable<ExcelBlossomRefreshRow>("BlossomRefreshExcelConfigData"),
    readExcelTable<ExcelBlossomGroupRow>("BlossomGroupsExcelConfigData"),
    readExcelTable<ExcelBlossomSectionOrderRow>("BlossomSectionOrderExcelConfigData"),
  );
  mkdirSync(LEY_LINE_REGION_DIRECTORY, { recursive: true });
  for (const [cityId, region] of regions) writeJsonFile(join(LEY_LINE_REGION_DIRECTORY, `${cityId}.json`), region);
};
