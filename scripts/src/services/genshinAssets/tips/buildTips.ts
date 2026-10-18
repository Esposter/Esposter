import type { ExcelPushTipsCodexRow } from "#src/models/genshinAssets/archive/ExcelPushTipsCodexRow";
import type { ExcelPushTipsRow } from "#src/models/genshinAssets/archive/ExcelPushTipsRow";
import type { ExcelGlobalWatcherRow } from "#src/models/genshinAssets/tips/ExcelGlobalWatcherRow";
import type { Tip } from "genshin-world";

import { PUSH_TIPS_CODEX_TABLE_NAME, PUSH_TIPS_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { GLOBAL_WATCHER_TABLE_NAME } from "#src/services/genshinAssets/tips/constants";
import { toTipRecords } from "#src/services/genshinAssets/tips/toTipRecords";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { tipSchema } from "genshin-world";

// Every tutorial tip the game's tables hold, checked against the world's schema, with a note of how many the Archive lists
// And how many a watcher's trigger shows
export const buildTips = (): { notes: string[]; tips: Tip[] } => {
  const tips = tipSchema
    .array()
    .parse(
      toTipRecords(
        readExcelTable<ExcelPushTipsRow>(PUSH_TIPS_TABLE_NAME),
        readExcelTable<ExcelPushTipsCodexRow>(PUSH_TIPS_CODEX_TABLE_NAME),
        readExcelTable<ExcelGlobalWatcherRow>(GLOBAL_WATCHER_TABLE_NAME),
      ),
    );
  const notes = [
    `${tips.length} tutorial tips`,
    `${tips.filter(({ codexId }) => codexId !== undefined).length} listed by the Archive`,
    `${tips.filter(({ trigger }) => trigger !== undefined).length} with a trigger in the tables`,
  ];
  return { notes, tips };
};
