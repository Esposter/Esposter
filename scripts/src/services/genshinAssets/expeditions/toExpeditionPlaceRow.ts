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
    // A rank condition is the table's default kind, which the dump leaves untyped
    const kind = condition.type ?? EXPEDITION_RANK_CONDITION;
    if (kind === EXPEDITION_RANK_CONDITION) rankLevel = Math.max(rankLevel, condition.AOCOBPPBOOL);
    else if (kind === EXPEDITION_POINT_CONDITION) {
      if (condition.OLDPDBIPNHD !== OPEN_WORLD_SCENE_ID)
        throw new InvalidOperationError(
          Operation.Read,
          String(row.id),
          `names a point in scene ${condition.OLDPDBIPNHD}`,
        );
      statuePointId = condition.AOCOBPPBOOL;
    } else if (kind === EXPEDITION_QUEST_CONDITION) questId = String(condition.AOCOBPPBOOL);
    else throw new InvalidOperationError(Operation.Read, String(row.id), `has a condition of kind ${kind}`);
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
