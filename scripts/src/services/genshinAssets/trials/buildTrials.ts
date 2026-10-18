import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { ExcelReliquaryAffixRow } from "#src/models/genshinAssets/stats/ExcelReliquaryAffixRow";
import type { ExcelReliquaryMainPropRow } from "#src/models/genshinAssets/stats/ExcelReliquaryMainPropRow";
import type { ExcelTrialAvatarActivityRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarActivityRow";
import type { ExcelTrialAvatarRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarRow";
import type { ExcelTrialAvatarTemplateRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarTemplateRow";
import type { ExcelTrialReliquaryRow } from "#src/models/genshinAssets/trials/ExcelTrialReliquaryRow";
import type { TrialReliquaryPiece } from "#src/models/genshinAssets/trials/TrialReliquaryPiece";
import type { WikiTrialBuild } from "#src/models/genshinAssets/trials/WikiTrialBuild";

import { toRewardItemsById } from "#src/services/genshinAssets/rewards/toRewardItemsById";
import { toTrialAvatar } from "#src/services/genshinAssets/trials/toTrialAvatar";
import { toTrialReliquary } from "#src/services/genshinAssets/trials/toTrialReliquary";
import { toTrialStage } from "#src/services/genshinAssets/trials/toTrialStage";
import { toTrialTemplate } from "#src/services/genshinAssets/trials/toTrialTemplate";
import { GameDataset } from "genshin-world";

// The character trials' records, each published under the dataset's key: the stages by id, the trial avatars by id, the
// Reliquaries by id, the templates by level, the weapon each trial character is fought with by character id, and the items
// Each stage's first-clear reward pays, keyed by the reward id. A reliquary no set names is left out, since no artifact is
// Worn from it
export interface TrialTables {
  affixRows: ExcelReliquaryAffixRow[];
  avatarRows: ExcelTrialAvatarRow[];
  mainPropRows: ExcelReliquaryMainPropRow[];
  pieceMap: ReadonlyMap<number, TrialReliquaryPiece>;
  reliquaryRows: ExcelTrialReliquaryRow[];
  rewardMap: ReadonlyMap<number, ExcelRewardRow>;
  stageRows: ExcelTrialAvatarActivityRow[];
  templateRows: ExcelTrialAvatarTemplateRow[];
  wikiBuilds: readonly WikiTrialBuild[];
}

export const buildTrials = ({
  affixRows,
  avatarRows,
  mainPropRows,
  pieceMap,
  reliquaryRows,
  rewardMap,
  stageRows,
  templateRows,
  wikiBuilds,
}: TrialTables): Record<string, unknown> => {
  const stages = stageRows.map((row) => toTrialStage(row));
  const rewardIds = new Set(stages.map(({ rewardId }) => rewardId));
  const mainPropTypeMap = new Map(mainPropRows.map(({ id, propType }) => [id, propType]));
  const affixMap = new Map(affixRows.map((row) => [row.id, row]));
  return {
    [`${GameDataset.CharacterTrials}/avatars`]: Object.fromEntries(
      avatarRows.map((row) => toTrialAvatar(row)).map((avatar) => [avatar.trialAvatarId, avatar]),
    ),
    [`${GameDataset.CharacterTrials}/builds`]: Object.fromEntries(
      wikiBuilds.map(({ characterId, constellation, refinement, weaponId }) => [
        characterId,
        { characterId, constellation, refinement, weaponId },
      ]),
    ),
    [`${GameDataset.CharacterTrials}/reliquaries`]: Object.fromEntries(
      reliquaryRows
        .filter(({ ReliquaryId }) => (pieceMap.get(ReliquaryId)?.setId ?? 0) > 0)
        .map((row) => toTrialReliquary(row, pieceMap, mainPropTypeMap, affixMap))
        .map((reliquary) => [reliquary.id, reliquary]),
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
