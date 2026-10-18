import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { ExcelReliquaryAffixRow } from "#src/models/genshinAssets/stats/ExcelReliquaryAffixRow";
import type { ExcelReliquaryMainPropRow } from "#src/models/genshinAssets/stats/ExcelReliquaryMainPropRow";
import type { ExcelTrialAvatarActivityRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarActivityRow";
import type { ExcelTrialAvatarRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarRow";
import type { ExcelTrialAvatarTemplateRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarTemplateRow";
import type { ExcelTrialReliquaryRow } from "#src/models/genshinAssets/trials/ExcelTrialReliquaryRow";
import type { TrialReliquaryPiece } from "#src/models/genshinAssets/trials/TrialReliquaryPiece";
import type { WikiTrialBuild } from "#src/models/genshinAssets/trials/WikiTrialBuild";

import { buildTrials } from "#src/services/genshinAssets/trials/buildTrials";
import { ArtifactSlot, Attribute } from "genshin-world";
import { describe, expect, test } from "vitest";

const CHARACTER_ID = 10_000_022;
const DUNGEON_ID = 6131;
const RELIQUARY_IDS = [91, 92, 93, 94, 95];
const REWARD_ID = 480_001;
const STAGE_ID = 51_001;
const TRIAL_AVATAR_ID = 1022;
const WEAPON_ID = 11_301;
const SET_RELIQUARY_ID = 60_211;
const NO_SET_RELIQUARY_ID = 20_002;
const SET_ID = 15_021;
const MAIN_PROP_ID = 15_004;
const AFFIX_ID = 201_053;

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
  {
    AppendPropList: [AFFIX_ID],
    Id: RELIQUARY_IDS[0],
    Level: 5,
    MainPropId: MAIN_PROP_ID,
    ReliquaryId: SET_RELIQUARY_ID,
  },
  { AppendPropList: [], Id: RELIQUARY_IDS[1], Level: 1, MainPropId: MAIN_PROP_ID, ReliquaryId: NO_SET_RELIQUARY_ID },
];
const pieceMap = new Map<number, TrialReliquaryPiece>([
  [SET_RELIQUARY_ID, { rarity: 5, setId: SET_ID, slot: ArtifactSlot.FlowerOfLife }],
  [NO_SET_RELIQUARY_ID, { rarity: 1, setId: 0, slot: ArtifactSlot.FlowerOfLife }],
]);
const mainPropRows: ExcelReliquaryMainPropRow[] = [
  { id: MAIN_PROP_ID, propDepotId: 5000, propType: Attribute.AttackPercent },
];
const affixRows: ExcelReliquaryAffixRow[] = [
  { depotId: 201, groupId: 5, id: AFFIX_ID, propType: Attribute.Attack, propValue: 4.67 },
];
const wikiBuilds: WikiTrialBuild[] = [
  {
    characterId: CHARACTER_ID,
    characterName: "Venti",
    constellation: 0,
    page: "Test Run - Character Trial Event",
    refinement: 1,
    weaponId: WEAPON_ID,
    weaponName: "Skyward Harp",
  },
];
const rewardMap = new Map<number, ExcelRewardRow>([
  [REWARD_ID, { rewardId: REWARD_ID, rewardItemList: [{ itemCount: 5, itemId: 201 }] }],
]);

describe(buildTrials, () => {
  test("a trial stage pays its first-clear reward, and its character is kept at its level", () => {
    expect.hasAssertions();
    expect(
      buildTrials({
        affixRows,
        avatarRows,
        mainPropRows,
        pieceMap,
        reliquaryRows,
        rewardMap,
        stageRows,
        templateRows,
        wikiBuilds,
      }),
    ).toStrictEqual({
      "characterTrials/avatars": {
        [TRIAL_AVATAR_ID]: { characterId: CHARACTER_ID, level: 90, trialAvatarId: TRIAL_AVATAR_ID },
      },
      "characterTrials/builds": {
        [CHARACTER_ID]: { characterId: CHARACTER_ID, constellation: 0, refinement: 1, weaponId: WEAPON_ID },
      },
      "characterTrials/reliquaries": {
        [RELIQUARY_IDS[0]]: {
          id: RELIQUARY_IDS[0],
          level: 4,
          mainAffix: Attribute.AttackPercent,
          minorAffixes: [{ attribute: Attribute.Attack, value: 4.67 }],
          rarity: 5,
          setId: SET_ID,
          slot: ArtifactSlot.FlowerOfLife,
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
