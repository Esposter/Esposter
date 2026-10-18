import type { ExcelTrialAvatarActivityRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarActivityRow";
import type { TrialStage } from "genshin-world";

// One stage with its trial avatar, its place in the event and the first-clear reward it pays
export const toTrialStage = ({
  dungeonId,
  firstPassReward,
  id,
  trialAvatarId,
  trialAvatarIndexId,
}: ExcelTrialAvatarActivityRow): TrialStage => ({
  dungeonId,
  id,
  rewardId: firstPassReward,
  trialAvatarId,
  trialAvatarIndexId,
});
