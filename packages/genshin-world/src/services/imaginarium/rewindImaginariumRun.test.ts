import type { ImaginariumMember } from "#src/models/imaginarium/ImaginariumMember";
import type { ImaginariumRun } from "#src/models/imaginarium/ImaginariumRun";

import { IMAGINARIUM_REWIND_COST, IMAGINARIUM_VIGOR } from "#src/services/imaginarium/constants";
import { rewindImaginariumRun } from "#src/services/imaginarium/rewindImaginariumRun";
import { describe, expect, test } from "vitest";

describe(rewindImaginariumRun, () => {
  const member: ImaginariumMember = {
    burstEnergyCost: 40,
    energy: 0,
    healthShare: 1,
    isSpecialGuest: false,
    maxHealth: 1000,
    vigor: IMAGINARIUM_VIGOR,
  };
  const checkpoint = [member];
  const principalCast = [{ ...member, vigor: 0 }];

  test("a run rewinds to its last boss stage", () => {
    expect.hasAssertions();

    const run: ImaginariumRun = { checkpoint, principalCast, rewinds: IMAGINARIUM_REWIND_COST * 2 };

    expect(rewindImaginariumRun(run)).toStrictEqual({
      checkpoint,
      principalCast: checkpoint,
      rewinds: IMAGINARIUM_REWIND_COST,
    });
  });

  test("a rewind is refused once the run's rewinds are used", () => {
    expect.hasAssertions();

    const run: ImaginariumRun = { checkpoint, principalCast, rewinds: 0 };

    expect(rewindImaginariumRun(run)).toStrictEqual(run);
  });
});
