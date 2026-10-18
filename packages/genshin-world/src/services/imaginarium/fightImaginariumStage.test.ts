import type { ImaginariumMember } from "#src/models/imaginarium/ImaginariumMember";

import { DomainChallengeOutcome } from "#src/models/domains/DomainChallengeOutcome";
import { checkIsImaginariumStageReady } from "#src/services/imaginarium/checkIsImaginariumStageReady";
import { IMAGINARIUM_PERFORMER_COUNT, IMAGINARIUM_VIGOR } from "#src/services/imaginarium/constants";
import { fightImaginariumStage } from "#src/services/imaginarium/fightImaginariumStage";
import { describe, expect, test } from "vitest";

describe(fightImaginariumStage, () => {
  const member: ImaginariumMember = { isSpecialGuest: false, vigor: IMAGINARIUM_VIGOR };
  const cast = Array.from({ length: IMAGINARIUM_PERFORMER_COUNT }, () => member);
  const progress = { defeatTarget: 3, defeats: 3, elapsedMilliseconds: 0, timeLimitMilliseconds: 1000 };

  test("a stage is fought by four performers with Vigor", () => {
    expect.hasAssertions();

    expect(checkIsImaginariumStageReady(cast)).toBe(true);
    expect(fightImaginariumStage(cast, progress, false)).toStrictEqual({
      isFought: true,
      outcome: DomainChallengeOutcome.Cleared,
      principalCast: cast.map(() => ({ isSpecialGuest: false, vigor: IMAGINARIUM_VIGOR - 1 })),
    });
  });

  test("a stage is refused without four performers", () => {
    expect.hasAssertions();

    const threePerformers = cast.slice(1);

    expect(fightImaginariumStage(threePerformers, progress, false)).toStrictEqual({
      isFought: false,
      principalCast: threePerformers,
    });
  });

  test("a stage whose party falls before its defeats is wiped", () => {
    expect.hasAssertions();

    expect(fightImaginariumStage(cast, { ...progress, defeats: 1 }, true)).toStrictEqual({
      isFought: true,
      outcome: DomainChallengeOutcome.Wiped,
      principalCast: cast.map(() => ({ isSpecialGuest: false, vigor: IMAGINARIUM_VIGOR - 1 })),
    });
  });
});
