import type { ArchiveCandidate } from "#src/models/genshinAssets/archive/ArchiveCandidate";
import type { ExcelPushTipsCodexRow } from "#src/models/genshinAssets/archive/ExcelPushTipsCodexRow";
import type { ExcelPushTipsRow } from "#src/models/genshinAssets/archive/ExcelPushTipsRow";

import {
  PUSH_TIPS_CODEX_TABLE_NAME,
  PUSH_TIPS_TABLE_NAME,
  PUSH_TIPS_TUTORIAL_TYPE,
} from "#src/services/genshinAssets/archive/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";

// The tutorials the Tutorials section lists, each in the codex's order and named by the title its push tip shows. A push
// Tip of another kind, such as a monster's, is not a tutorial
export const readTutorialCandidates = (): ArchiveCandidate[] => {
  const titleTextMapHashMap = new Map(
    readExcelTable<ExcelPushTipsRow>(PUSH_TIPS_TABLE_NAME)
      .filter(({ pushTipsType }) => pushTipsType === PUSH_TIPS_TUTORIAL_TYPE)
      .map(({ pushTipsId, titleTextMapHash }) => [pushTipsId, titleTextMapHash]),
  );
  return readExcelTable<ExcelPushTipsCodexRow>(PUSH_TIPS_CODEX_TABLE_NAME).flatMap(
    ({ id, isDisuse, pushTipId, sortOrder }) => {
      const nameTextMapHash = titleTextMapHashMap.get(pushTipId);
      return isDisuse || nameTextMapHash === undefined ? [] : [{ id, nameTextMapHash, sortOrder }];
    },
  );
};
