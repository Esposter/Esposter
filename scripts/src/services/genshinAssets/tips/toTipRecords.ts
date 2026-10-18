import type { ExcelPushTipsCodexRow } from "#src/models/genshinAssets/archive/ExcelPushTipsCodexRow";
import type { ExcelPushTipsRow } from "#src/models/genshinAssets/archive/ExcelPushTipsRow";
import type { ExcelGlobalWatcherRow } from "#src/models/genshinAssets/tips/ExcelGlobalWatcherRow";
import type { Tip, TipTrigger } from "genshin-world";

import { PUSH_TIPS_TUTORIAL_TYPE } from "#src/services/genshinAssets/archive/constants";

// The tutorial push tips, each with the Archive entry the codex files it under and the trigger its watcher gives. A push
// Tip of another kind, such as a monster's, is not a tutorial. A watcher the global table lacks, or one with no trigger
// Kind, leaves its tip with no trigger, and a parameter the table leaves empty is left out
export const toTipRecords = (
  pushTipRows: readonly ExcelPushTipsRow[],
  codexRows: readonly ExcelPushTipsCodexRow[],
  watcherRows: readonly ExcelGlobalWatcherRow[],
): Tip[] => {
  const codexIdMap = new Map(codexRows.filter(({ isDisuse }) => !isDisuse).map(({ id, pushTipId }) => [pushTipId, id]));
  const triggerMap = new Map<number, TipTrigger>(
    watcherRows.flatMap(({ id, triggerConfig }) =>
      triggerConfig?.triggerType
        ? [
            [
              id,
              {
                paramList: triggerConfig.paramList.filter((param) => param !== ""),
                triggerType: triggerConfig.triggerType,
              },
            ],
          ]
        : [],
    ),
  );
  return pushTipRows
    .filter(({ pushTipsType }) => pushTipsType === PUSH_TIPS_TUTORIAL_TYPE)
    .map(({ pushTipsId, subtitleTextMapHash, titleTextMapHash, watcherId }) => {
      const codexId = codexIdMap.get(pushTipsId);
      const trigger = watcherId === undefined ? undefined : triggerMap.get(watcherId);
      const tip: Tip = {
        id: pushTipsId,
        subtitleTextId: String(subtitleTextMapHash),
        titleTextId: String(titleTextMapHash),
      };
      if (codexId !== undefined) tip.codexId = codexId;
      if (trigger !== undefined) tip.trigger = trigger;
      return tip;
    });
};
