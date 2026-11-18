import type { ExcelTrialAvatarRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarRow";

import { toImaginariumOpeningTrials } from "#src/services/genshinAssets/imaginarium/toImaginariumOpeningTrials";
import { describe, expect, test } from "vitest";

describe(toImaginariumOpeningTrials, () => {
  test("an opening character's trial version is read at its level", () => {
    expect.hasAssertions();

    const trials = new Map<number, ExcelTrialAvatarRow>([
      [6080, { trialAvatarId: 6080, trialAvatarParamList: [10000096, 80] }],
    ]);

    expect(toImaginariumOpeningTrials([6080], trials)).toStrictEqual([
      { characterId: 10000096, level: 80, trialAvatarId: 6080 },
    ]);
  });
});
