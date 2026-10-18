import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { ExcelTrialAvatarActivityRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarActivityRow";
import type { ExcelTrialAvatarRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarRow";
import type { ExcelTrialAvatarTemplateRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarTemplateRow";
import type { ExcelTrialReliquaryRow } from "#src/models/genshinAssets/trials/ExcelTrialReliquaryRow";

import { toRewardItemsById } from "#src/services/genshinAssets/rewards/toRewardItemsById";
import { toTrialAvatar } from "#src/services/genshinAssets/trials/toTrialAvatar";
import { toTrialReliquary } from "#src/services/genshinAssets/trials/toTrialReliquary";
import { toTrialStage } from "#src/services/genshinAssets/trials/toTrialStage";
import { toTrialTemplate } from "#src/services/genshinAssets/trials/toTrialTemplate";
import { GameDataset } from "genshin-world";

// The character trials' records, each published under the dataset's key: the stages by id, the trial avatars by id, the
// Reliquaries by id, the templates by level and the items each stage's first-clear reward pays, keyed by the reward id
export interface TrialTables {
  avatarRows: ExcelTrialAvatarRow[];
  reliquaryRows: ExcelTrialReliquaryRow[];
  rewardMap: ReadonlyMap<number, ExcelRewardRow>;
  stageRows: ExcelTrialAvatarActivityRow[];
  templateRows: ExcelTrialAvatarTemplateRow[];
}

export const buildTrials = ({
  avatarRows,
  reliquaryRows,
  rewardMap,
  stageRows,
  templateRows,
}: TrialTables): Record<string, unknown> => {
  const stages = stageRows.map((row) => toTrialStage(row));
  const rewardIds = new Set(stages.map(({ rewardId }) => rewardId));
  return {
    [`${GameDataset.CharacterTrials}/avatars`]: Object.fromEntries(
      avatarRows.map((row) => toTrialAvatar(row)).map((avatar) => [avatar.trialAvatarId, avatar]),
    ),
    [`${GameDataset.CharacterTrials}/reliquaries`]: Object.fromEntries(
      reliquaryRows.map((row) => toTrialReliquary(row)).map((reliquary) => [reliquary.id, reliquary]),
    ),
    [`${GameDataset.CharacterTrials}/rewards`]: Object.fromEntries(
      [...rewardIds].map((rewardId) => [rewardId, toRewardItemsById(rewardId, rewardMap)]),
    ),
    [`${GameDataset.CharacterTrials}/stages`]: Object.fromEntries(stages.map((stage) => [stage.id, stage])),
    [`${GameDataset.CharacterTrials}/templates`]: templateRows
      .map((row) => toTrialTemplate(row))
      .toSorted((firstTemplate, secondTemplate) => firstTemplate.level - secondTemplate.level),
  };
};
