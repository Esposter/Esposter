import type { ImaginariumMember } from "#src/models/imaginarium/ImaginariumMember";

import { DomainChallengeOutcome } from "#src/models/domains/DomainChallengeOutcome";
import { IMAGINARIUM_PERFORMER_COUNT, IMAGINARIUM_VIGOR } from "#src/services/imaginarium/constants";
import { startImaginariumStage } from "#src/services/imaginarium/startImaginariumStage";
import { describe, expect, test } from "vitest";

describe(startImaginariumStage, () => {
  const member: ImaginariumMember = {
    burstEnergyCost: 40,
    energy: 0,
    healthShare: 1,
    isSpecialGuest: false,
    maxHealth: 1000,
    vigor: IMAGINARIUM_VIGOR,
  };
  const checkpoint = Array.from({ length: IMAGINARIUM_PERFORMER_COUNT }, () => member);
  const progress = { defeats: 3, defeatTarget: 3, elapsedMilliseconds: 0, timeLimitMilliseconds: 1000 };

  test("fewer than four performers with Vigor leads to a rewind", () => {
    expect.hasAssertions();

    const principalCast = checkpoint.map((performer, index) =>
      index === IMAGINARIUM_PERFORMER_COUNT - 1 ? { ...performer, vigor: 0 } : performer,
    );

    expect(startImaginariumStage({ checkpoint, principalCast, rewinds: 1 }, progress, false)).toStrictEqual({
      fight: { isFought: false, principalCast },
      run: { checkpoint, principalCast: checkpoint, rewinds: 0 },
    });
  });

  test("a stage fought by four performers with Vigor keeps the run's rewinds", () => {
    expect.hasAssertions();

    const performed = checkpoint.map((performer) => ({
      ...performer,
      energy: performer.burstEnergyCost,
      vigor: IMAGINARIUM_VIGOR - 1,
    }));

    expect(startImaginariumStage({ checkpoint, principalCast: checkpoint, rewinds: 1 }, progress, false)).toStrictEqual(
      {
        fight: { isFought: true, outcome: DomainChallengeOutcome.Cleared, principalCast: performed },
        run: { checkpoint, principalCast: performed, rewinds: 1 },
      },
    );
  });
});
