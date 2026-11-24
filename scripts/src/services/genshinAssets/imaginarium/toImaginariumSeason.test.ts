import type { ExcelRoleCombatAvatarConfigRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatAvatarConfigRow";
import type { ExcelRoleCombatScheduleRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatScheduleRow";
import type { ExcelTrialAvatarRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarRow";

import { toImaginariumSeason } from "#src/services/genshinAssets/imaginarium/toImaginariumSeason";
import { Element } from "genshin-world/definitions";
import { describe, expect, test } from "vitest";

describe(toImaginariumSeason, () => {
  const scheduleRow: ExcelRoleCombatScheduleRow = {
    avatarConfigId: 3,
    beginTimeStr: "1970-01-01 00:00:00",
    difficultyIds: [1, 2],
    endTimeStr: "1970-01-01 00:00:01",
    rewardGroupId: 2,
    scheduleId: 1,
  };
  const avatarConfigRow: ExcelRoleCombatAvatarConfigRow = {
    avatarConfigId: 3,
    elementCodes: [2, 5, 6, 0],
    openingCharacterIds: [1, 2],
    openingTrialIds: [7, 8],
    specialGuestIds: [4],
  };
  const trials = new Map<number, ExcelTrialAvatarRow>([
    [7, { trialAvatarId: 7, trialAvatarParamList: [1, 80] }],
    [8, { trialAvatarId: 8, trialAvatarParamList: [2, 90] }],
  ]);

  test("reads Pyro, Electro and Cryo from the codes, the trailing 0 dropped", () => {
    expect.hasAssertions();

    expect(toImaginariumSeason(scheduleRow, avatarConfigRow, trials)).toStrictEqual({
      beginsAt: "1970-01-01T00:00:00",
      difficultyIds: [1, 2],
      elements: [Element.Pyro, Element.Electro, Element.Cryo],
      endsAt: "1970-01-01T00:00:01",
      id: 1,
      openingCharacterIds: [1, 2],
      openingTrials: [
        { characterId: 1, level: 80, trialAvatarId: 7 },
        { characterId: 2, level: 90, trialAvatarId: 8 },
      ],
      rewardGroup: 2,
      specialGuestIds: [4],
    });
  });
});
