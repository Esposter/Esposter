import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { ExcelTrialAvatarActivityRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarActivityRow";
import type { ExcelTrialAvatarRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarRow";
import type { ExcelTrialAvatarTemplateRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarTemplateRow";
import type { ExcelTrialReliquaryRow } from "#src/models/genshinAssets/trials/ExcelTrialReliquaryRow";

import { buildTrials } from "#src/services/genshinAssets/trials/buildTrials";
import { describe, expect, test } from "vitest";

const CHARACTER_ID = 10_000_022;
const DUNGEON_ID = 6131;
const RELIQUARY_IDS = [91, 92, 93, 94, 95];
const REWARD_ID = 480_001;
const STAGE_ID = 51_001;
const TRIAL_AVATAR_ID = 1022;

const avatarRows: ExcelTrialAvatarRow[] = [
  { trialAvatarId: TRIAL_AVATAR_ID, trialAvatarParamList: [CHARACTER_ID, 90] },
];
const stageRows: ExcelTrialAvatarActivityRow[] = [
  {
    dungeonId: DUNGEON_ID,
    firstPassReward: REWARD_ID,
    id: STAGE_ID,
    trialAvatarId: TRIAL_AVATAR_ID,
    trialAvatarIndexId: 1,
  },
];
const templateRows: ExcelTrialAvatarTemplateRow[] = [
  { TrialAvatarLevel: 85, TrialAvatarSkillLevel: 8, TrialReliquaryList: RELIQUARY_IDS },
];
const reliquaryRows: ExcelTrialReliquaryRow[] = [
  { AppendPropList: [201_053], Id: RELIQUARY_IDS[0], Level: 5, MainPropId: 15_004, ReliquaryId: 60_211 },
];
const rewardMap = new Map<number, ExcelRewardRow>([
  [REWARD_ID, { rewardId: REWARD_ID, rewardItemList: [{ itemCount: 5, itemId: 201 }] }],
]);

describe(buildTrials, () => {
  test("a trial stage pays its first-clear reward, and its character is kept at its level", () => {
    expect.hasAssertions();
    expect(buildTrials({ avatarRows, reliquaryRows, rewardMap, stageRows, templateRows })).toStrictEqual({
      "characterTrials/avatars": {
        [TRIAL_AVATAR_ID]: { characterId: CHARACTER_ID, level: 90, trialAvatarId: TRIAL_AVATAR_ID },
      },
      "characterTrials/reliquaries": {
        [RELIQUARY_IDS[0]]: {
          appendPropIds: [201_053],
          id: RELIQUARY_IDS[0],
          level: 5,
          mainPropId: 15_004,
          reliquaryId: 60_211,
        },
      },
      "characterTrials/rewards": { [REWARD_ID]: [{ count: 5, itemId: 201 }] },
      "characterTrials/stages": {
        [STAGE_ID]: {
          dungeonId: DUNGEON_ID,
          id: STAGE_ID,
          rewardId: REWARD_ID,
          trialAvatarId: TRIAL_AVATAR_ID,
          trialAvatarIndexId: 1,
        },
      },
      "characterTrials/templates": [{ level: 85, reliquaryIds: RELIQUARY_IDS, talentLevel: 8 }],
    });
  });
});
