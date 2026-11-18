import { checkIsOpeningTrialsMatched } from "#src/services/genshinAssets/imaginarium/checkIsOpeningTrialsMatched";
import { describe, expect, test } from "vitest";

describe(checkIsOpeningTrialsMatched, () => {
  test("a season whose trial versions are not its openers' fails its data run", () => {
    expect.hasAssertions();

    expect(
      checkIsOpeningTrialsMatched(
        [10000096, 10000050],
        [
          { characterId: 10000096, level: 80, trialAvatarId: 6080 },
          { characterId: 10000026, level: 80, trialAvatarId: 6026 },
        ],
      ),
    ).toBe(false);
  });

  test("a season whose trial versions are its openers' passes the data run", () => {
    expect.hasAssertions();

    expect(
      checkIsOpeningTrialsMatched(
        [10000096, 10000050],
        [
          { characterId: 10000050, level: 80, trialAvatarId: 6050 },
          { characterId: 10000096, level: 80, trialAvatarId: 6080 },
        ],
      ),
    ).toBe(true);
  });
});
