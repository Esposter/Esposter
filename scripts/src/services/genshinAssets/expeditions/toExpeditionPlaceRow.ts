import type { ExcelExpeditionDataRow } from "#src/models/genshinAssets/expeditions/ExcelExpeditionDataRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/expeditions/ExcelRewardPreviewRow";
import type { ExpeditionPlaceRow } from "#src/models/genshinAssets/expeditions/ExpeditionPlaceRow";

import {
  EXPEDITION_POINT_CONDITION,
  EXPEDITION_QUEST_CONDITION,
  EXPEDITION_RANK_CONDITION,
} from "#src/services/genshinAssets/expeditions/constants";
import { toPreviewItems } from "#src/services/genshinAssets/rewards/toPreviewItems";
import { OPEN_WORLD_SCENE_ID } from "#src/services/genshinAssets/shared/constants";
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
  for (const condition of row.MOOEHHLEOOB) {
    // The table's default condition, the rank at zero, is written with no fields, and a rank is the default kind
    const { AOCOBPPBOOL: value = 0, OLDPDBIPNHD: scene = 0, type = EXPEDITION_RANK_CONDITION } = condition;
    if (type === EXPEDITION_RANK_CONDITION) rankLevel = Math.max(rankLevel, value);
    else if (type === EXPEDITION_POINT_CONDITION) {
      if (scene !== OPEN_WORLD_SCENE_ID)
        throw new InvalidOperationError(Operation.Read, String(row.id), `names a point in scene ${scene}`);
      statuePointId = value;
    } else if (type === EXPEDITION_QUEST_CONDITION) questId = String(value);
    else throw new InvalidOperationError(Operation.Read, String(row.id), `has a condition of kind ${type}`);
  }
  return {
    durations: row.PLLAFKOKDDE.map((duration) => {
      const rewardPreview = rewardPreviews.get(duration.rewardPreview);
      if (!rewardPreview)
        throw new InvalidOperationError(
          Operation.Read,
          String(row.id),
          `has no reward preview ${duration.rewardPreview}`,
        );
      return { hours: duration.AMICCHBIALF, items: toPreviewItems(rewardPreview) };
    }),
    id: row.id,
    nameTextId: String(row.nameTextMapHash),
    questId,
    rankLevel,
    statuePointId,
  };
};
