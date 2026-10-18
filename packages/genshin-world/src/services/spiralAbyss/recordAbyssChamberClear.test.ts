import type { PartyMember } from "#src/models/party/PartyMember";
import type { AbyssChallenge } from "#src/models/spiralAbyss/AbyssChallenge";
import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssFloorReward } from "#src/models/spiralAbyss/AbyssFloorReward";
import type { AbyssProgress } from "#src/models/spiralAbyss/AbyssProgress";

import { AbyssStarConditionKind } from "#src/models/spiralAbyss/AbyssStarConditionKind";
import { createElementalState } from "#src/services/combat/aura/createElementalState";
import { recordAbyssChamberClear } from "#src/services/spiralAbyss/recordAbyssChamberClear";
import { describe, expect, test } from "vitest";

describe(recordAbyssChamberClear, () => {
  const FIRST_CHAMBER_ID = 1;
  const SECOND_CHAMBER_ID = 2;
  const THIRD_CHAMBER_ID = 3;
  const CONDITIONS = [
    { kind: AbyssStarConditionKind.LeftTime, threshold: 90 },
    { kind: AbyssStarConditionKind.LeftTime, threshold: 150 },
    { kind: AbyssStarConditionKind.LeftTime, threshold: 210 },
  ];
  const firstChamber: AbyssChamber = {
    conditions: CONDITIONS,
    halfMonsterDescribeIds: [],
    id: FIRST_CHAMBER_ID,
    index: 1,
    monsterLevel: 1,
  };
  const secondChamber: AbyssChamber = {
    conditions: CONDITIONS,
    halfMonsterDescribeIds: [],
    id: SECOND_CHAMBER_ID,
    index: 2,
    monsterLevel: 1,
  };
  const thirdChamber: AbyssChamber = {
    conditions: CONDITIONS,
    halfMonsterDescribeIds: [],
    id: THIRD_CHAMBER_ID,
    index: 3,
    monsterLevel: 1,
  };
  const floor: AbyssFloor = {
    chambers: [firstChamber, secondChamber, thirdChamber],
    id: 1,
    index: 1,
    teamCount: 1,
    unlockStarCount: 6,
  };
  const reward: AbyssFloorReward = {
    chamberRewardIds: [101, 102, 103],
    floorIndex: 1,
    nineStarRewardId: 203,
    rewardGroup: 1,
    sixStarRewardId: 202,
    threeStarRewardId: 201,
  };
  // A challenge that clears with every condition met, and one that clears with none
  const threeStarChallenge: AbyssChallenge = {
    defeatedHalfCount: 1,
    halfCount: 1,
    monolithPercent: undefined,
    secondsLeft: 300,
  };
  const noStarChallenge: AbyssChallenge = { ...threeStarChallenge, secondsLeft: 0 };
  const emptyProgress: AbyssProgress = { chamberIdProgressMap: new Map(), claimedRewardIds: new Set() };
  const EMPTY_PARTY = new Map<number, PartyMember>();

  test("should give a chamber's own reward on its first clear", () => {
    expect.hasAssertions();

    expect(
      recordAbyssChamberClear(emptyProgress, floor, firstChamber, noStarChallenge, reward, EMPTY_PARTY),
    ).toStrictEqual({
      carry: [],
      givenRewardIds: [101],
      progress: {
        chamberIdProgressMap: new Map([[FIRST_CHAMBER_ID, { isCleared: true, stars: 0 }]]),
        claimedRewardIds: new Set([101]),
      },
    });
  });

  test("should give a floor's star milestone once, and each chamber's reward only on its first clear", () => {
    expect.hasAssertions();

    const firstClear = recordAbyssChamberClear(
      emptyProgress,
      floor,
      firstChamber,
      threeStarChallenge,
      reward,
      EMPTY_PARTY,
    );
    expect(firstClear.givenRewardIds).toStrictEqual([101, 201]);

    const repeatClear = recordAbyssChamberClear(
      firstClear.progress,
      floor,
      firstChamber,
      threeStarChallenge,
      reward,
      EMPTY_PARTY,
    );
    expect(repeatClear.givenRewardIds).toStrictEqual([]);

    const secondChamberClear = recordAbyssChamberClear(
      repeatClear.progress,
      floor,
      secondChamber,
      noStarChallenge,
      reward,
      EMPTY_PARTY,
    );
    expect(secondChamberClear.givenRewardIds).toStrictEqual([102]);
  });

  test("clearing a chamber with time left earns its stars", () => {
    expect.hasAssertions();

    const oneStarChallenge: AbyssChallenge = { ...threeStarChallenge, secondsLeft: 120 };

    const { progress } = recordAbyssChamberClear(
      emptyProgress,
      floor,
      firstChamber,
      oneStarChallenge,
      reward,
      EMPTY_PARTY,
    );
    expect(progress.chamberIdProgressMap.get(FIRST_CHAMBER_ID)).toStrictEqual({ isCleared: true, stars: 1 });
  });

  test("should keep the most stars any clear of a chamber has earned", () => {
    expect.hasAssertions();

    const threeStarClear = recordAbyssChamberClear(
      emptyProgress,
      floor,
      firstChamber,
      threeStarChallenge,
      reward,
      EMPTY_PARTY,
    );
    const weakerClear = recordAbyssChamberClear(
      threeStarClear.progress,
      floor,
      firstChamber,
      noStarChallenge,
      reward,
      EMPTY_PARTY,
    );

    expect(weakerClear.progress.chamberIdProgressMap.get(FIRST_CHAMBER_ID)).toStrictEqual({
      isCleared: true,
      stars: 3,
    });
  });

  test("should carry each member's health and energy as they stand at the clear", () => {
    expect.hasAssertions();

    const party = new Map<number, PartyMember>([
      [
        1,
        {
          bondOfLifeClearedShare: 0,
          bondOfLifeShare: 0,
          burstCooldownSeconds: 0,
          elementalState: createElementalState(),
          energy: 40,
          healthShare: 0.5,
          skillCooldownSeconds: 0,
        },
      ],
      [
        2,
        {
          bondOfLifeClearedShare: 0,
          bondOfLifeShare: 0,
          burstCooldownSeconds: 0,
          elementalState: createElementalState(),
          energy: 0,
          healthShare: 0.25,
          skillCooldownSeconds: 0,
        },
      ],
    ]);

    expect(
      recordAbyssChamberClear(emptyProgress, floor, firstChamber, noStarChallenge, reward, party).carry,
    ).toStrictEqual([
      { characterId: 1, energy: 40, healthShare: 0.5 },
      { characterId: 2, energy: 0, healthShare: 0.25 },
    ]);
  });
});
