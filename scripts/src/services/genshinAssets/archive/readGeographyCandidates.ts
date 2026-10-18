import type { ExcelViewCodexRow } from "#src/models/genshinAssets/archive/ExcelViewCodexRow";
import type { ViewpointCandidate } from "#src/models/genshinAssets/archive/ViewpointCandidate";

import { VIEW_CODEX_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";

// The viewpoints the Geography section lists, each in the codex's order and named by its own row, with the group and
// Config id the scene group record places it by
export const readGeographyCandidates = (): ViewpointCandidate[] =>
  readExcelTable<ExcelViewCodexRow>(VIEW_CODEX_TABLE_NAME)
    .filter(({ isDisuse }) => !isDisuse)
    .map(({ configId, groupId, id, nameTextMapHash, sortOrder }) => ({
      configId,
      groupId,
      id,
      nameTextMapHash,
      sortOrder,
    }));
