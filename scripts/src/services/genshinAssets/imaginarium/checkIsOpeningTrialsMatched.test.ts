import { checkIsOpeningTrialsMatched } from "#src/services/genshinAssets/imaginarium/checkIsOpeningTrialsMatched";
import { describe, expect, test } from "vitest";

describe(checkIsOpeningTrialsMatched, () => {
  test("a season whose trial versions are not its openers' fails its data run", () => {
    expect.hasAssertions();

    expect(
      checkIsOpeningTrialsMatched(
        [1, 2],
        [
          { characterId: 1, level: 0, trialAvatarId: 0 },
          { characterId: 3, level: 0, trialAvatarId: 0 },
        ],
      ),
    ).toBe(false);
  });

  test("a season whose trial versions are its openers' passes the data run", () => {
    expect.hasAssertions();

    expect(
      checkIsOpeningTrialsMatched(
        [1, 2],
        [
          { characterId: 2, level: 0, trialAvatarId: 0 },
          { characterId: 1, level: 0, trialAvatarId: 0 },
        ],
      ),
    ).toBe(true);
  });
});
