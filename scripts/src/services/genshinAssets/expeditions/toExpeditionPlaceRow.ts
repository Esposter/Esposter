import type { ExcelExpeditionDataRow } from "#src/models/genshinAssets/expeditions/ExcelExpeditionDataRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/expeditions/ExcelRewardPreviewRow";
import type { ExpeditionPlaceRow } from "#src/models/genshinAssets/expeditions/ExpeditionPlaceRow";

import {
  EXPEDITION_POINT_CONDITION,
  EXPEDITION_QUEST_CONDITION,
  EXPEDITION_RANK_CONDITION,
  EXPEDITION_SCENE_ID,
} from "#src/services/genshinAssets/expeditions/constants";
import { parseRewardCount } from "#src/services/genshinAssets/expeditions/parseRewardCount";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One place as the world reads it. Its Adventure Rank is the highest rank condition it names, its statue a point of the
// Overworld, its quest a quest id, and each duration's items are its reward preview's, with a count drawn from its range.
// A condition of another kind, a statue in another scene or a preview the table lacks is an error, since the rule would
// Otherwise open the place wrongly
export const toExpeditionPlaceRow = (
  row: ExcelExpeditionDataRow,
  rewardPreviews: ReadonlyMap<number, ExcelRewardPreviewRow>,
): ExpeditionPlaceRow => {
  let rankLevel = 0;
  let statuePointId = 0;
  let questId = "";
  for (const condition of row.CHMIGIHPMFH)
    if (condition.type === EXPEDITION_RANK_CONDITION) rankLevel = Math.max(rankLevel, condition.CIMKGJIONHO);
    else if (condition.type === EXPEDITION_POINT_CONDITION) {
      if (condition.PCPMLMPDAFH !== EXPEDITION_SCENE_ID)
        throw new InvalidOperationError(
          Operation.Read,
          String(row.id),
          `names a point in scene ${condition.PCPMLMPDAFH}`,
        );
      statuePointId = condition.CIMKGJIONHO;
    } else if (condition.type === EXPEDITION_QUEST_CONDITION) questId = String(condition.CIMKGJIONHO);
    else throw new InvalidOperationError(Operation.Read, String(row.id), `has a condition of kind ${condition.type}`);
  return {
    durations: row.FPIOLKODPMI.map((duration) => {
      const rewardPreview = rewardPreviews.get(duration.rewardPreview);
      if (!rewardPreview)
        throw new InvalidOperationError(
          Operation.Read,
          String(row.id),
          `has no reward preview ${duration.rewardPreview}`,
        );
      return {
        hours: duration.GBGCPBEJAEN,
        items: rewardPreview.previewItems
          .filter(({ id }) => id !== 0)
          .map(({ count, id }) => {
            const { maxCount, minCount } = parseRewardCount(count);
            return { itemId: id, maxCount, minCount };
          }),
      };
    }),
    id: row.id,
    nameTextId: String(row.nameTextMapHash),
    questId,
    rankLevel,
    statuePointId,
  };
};
