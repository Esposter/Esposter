import type { ArchiveCandidate } from "#src/models/genshinAssets/archive/ArchiveCandidate";
import type { ExcelViewCodexRow } from "#src/models/genshinAssets/archive/ExcelViewCodexRow";

import { VIEW_CODEX_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";

// The viewpoints the Geography section lists, each in the codex's order and named by its own row
export const readGeographyCandidates = (): ArchiveCandidate[] =>
  readExcelTable<ExcelViewCodexRow>(VIEW_CODEX_TABLE_NAME)
    .filter(({ isDisuse }) => !isDisuse)
    .map(({ id, nameTextMapHash, sortOrder }) => ({ id, nameTextMapHash, sortOrder }));
