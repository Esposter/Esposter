import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { ExcelReliquaryAffixRow } from "#src/models/genshinAssets/stats/ExcelReliquaryAffixRow";
import type { ExcelReliquaryMainPropRow } from "#src/models/genshinAssets/stats/ExcelReliquaryMainPropRow";
import type { ExcelTrialAvatarActivityRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarActivityRow";
import type { ExcelTrialAvatarRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarRow";
import type { ExcelTrialAvatarTemplateRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarTemplateRow";
import type { ExcelTrialReliquaryRow } from "#src/models/genshinAssets/trials/ExcelTrialReliquaryRow";
import type { TrialReliquaryPiece } from "#src/models/genshinAssets/trials/TrialReliquaryPiece";
import type { WikiTrialBuild } from "#src/models/genshinAssets/trials/WikiTrialBuild";
import type { TrialReliquary } from "genshin-world";

import { buildTrials } from "#src/services/genshinAssets/trials/buildTrials";
import { takeOne } from "@esposter/shared";
import { ArtifactSlot, Attribute } from "genshin-world";
import { assert, describe, expect, test } from "vitest";

describe(buildTrials, () => {
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
  const SECOND_AFFIX_ID = 201_054;

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
      Id: takeOne(RELIQUARY_IDS),
      Level: 5,
      MainPropId: MAIN_PROP_ID,
      ReliquaryId: SET_RELIQUARY_ID,
    },
    {
      AppendPropList: [],
      Id: takeOne(RELIQUARY_IDS, 1),
      Level: 1,
      MainPropId: MAIN_PROP_ID,
      ReliquaryId: NO_SET_RELIQUARY_ID,
    },
  ];
  const pieceMap = new Map<number, TrialReliquaryPiece>([
    [NO_SET_RELIQUARY_ID, { rarity: 1, setId: 0, slot: ArtifactSlot.FlowerOfLife }],
    [SET_RELIQUARY_ID, { rarity: 5, setId: SET_ID, slot: ArtifactSlot.FlowerOfLife }],
  ]);
  const mainPropRows: ExcelReliquaryMainPropRow[] = [
    { id: MAIN_PROP_ID, propDepotId: 5000, propType: Attribute.AttackPercent },
  ];
  const affixRows: ExcelReliquaryAffixRow[] = [
    { depotId: 201, groupId: 5, id: AFFIX_ID, propType: Attribute.Attack, propValue: 4.67 },
    { depotId: 201, groupId: 5, id: SECOND_AFFIX_ID, propType: Attribute.Attack, propValue: 5.25 },
  ];
  const wikiBuilds: WikiTrialBuild[] = [
    {
      characterId: CHARACTER_ID,
      characterName: "characterName",
      constellation: 0,
      page: "page",
      refinement: 1,
      weaponId: WEAPON_ID,
      weaponName: "weaponName",
    },
  ];
  const rewardMap = new Map<number, ExcelRewardRow>([
    [REWARD_ID, { rewardId: REWARD_ID, rewardItemList: [{ itemCount: 5, itemId: 201 }] }],
  ]);
  const trialTables = {
    affixRows,
    avatarRows,
    mainPropRows,
    pieceMap,
    reliquaryRows,
    rewardMap,
    stageRows,
    templateRows,
    wikiBuilds,
  };

  test("a trial stage pays its first-clear reward, and its character is kept at its level", () => {
    expect.hasAssertions();
    expect(buildTrials(trialTables)).toStrictEqual({
      "characterTrials/avatars": {
        [TRIAL_AVATAR_ID]: { characterId: CHARACTER_ID, level: 90, trialAvatarId: TRIAL_AVATAR_ID },
      },
      "characterTrials/builds": {
        [CHARACTER_ID]: { characterId: CHARACTER_ID, constellation: 0, refinement: 1, weaponId: WEAPON_ID },
      },
      "characterTrials/reliquaries": {
        [takeOne(RELIQUARY_IDS)]: {
          id: takeOne(RELIQUARY_IDS),
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

  test("a sub-stat a trial reliquary rolled more than once is one line at its rolls' sum", () => {
    expect.hasAssertions();

    // The records buildTrials returns are typed unknown, so the reliquary record takes toTrialReliquary's type
    const reliquaries = buildTrials({
      ...trialTables,
      reliquaryRows: [{ ...takeOne(reliquaryRows), AppendPropList: [AFFIX_ID, SECOND_AFFIX_ID, AFFIX_ID] }],
    })["characterTrials/reliquaries"] as Record<string, TrialReliquary>;
    const reliquary = reliquaries[String(takeOne(RELIQUARY_IDS))];

    assert.exists(reliquary);
    expect(reliquary.minorAffixes).toStrictEqual([{ attribute: Attribute.Attack, value: 4.67 + 5.25 + 4.67 }]);
  });

  test("a trial reliquary whose piece the reliquary table lacks is refused rather than left out", () => {
    expect.hasAssertions();

    expect(() =>
      buildTrials({ ...trialTables, pieceMap: new Map<number, TrialReliquaryPiece>() }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 91, names no reliquary in the reliquary table]`,
    );
  });
});
