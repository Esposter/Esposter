import type { ArchiveCandidate } from "#src/models/genshinAssets/archive/ArchiveCandidate";
import type { ExcelPushTipsCodexRow } from "#src/models/genshinAssets/shared/ExcelPushTipsCodexRow";
import type { ExcelPushTipsRow } from "#src/models/genshinAssets/shared/ExcelPushTipsRow";

import { PUSH_TIPS_CODEX_TABLE_NAME, PUSH_TIPS_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { toTutorialPushTipMap } from "#src/services/genshinAssets/archive/toTutorialPushTipMap";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";

// The tutorials the Tutorials section lists, each in the codex's order and named by the title its push tip shows. A push
// Tip of another kind, such as a monster's, is not a tutorial
export const readTutorialCandidates = (): ArchiveCandidate[] => {
  const tutorialPushTipMap = toTutorialPushTipMap(readExcelTable<ExcelPushTipsRow>(PUSH_TIPS_TABLE_NAME));
  return readExcelTable<ExcelPushTipsCodexRow>(PUSH_TIPS_CODEX_TABLE_NAME).flatMap(
    ({ id, isDisuse, pushTipId, sortOrder }) => {
      const pushTipRow = tutorialPushTipMap.get(pushTipId);
      return isDisuse || pushTipRow === undefined
        ? []
        : [{ id, nameTextMapHash: pushTipRow.titleTextMapHash, sortOrder }];
    },
  );
};
