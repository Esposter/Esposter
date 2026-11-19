import { toFishTagMap } from "#src/services/genshinAssets/fishing/toFishTagMap";
import { describe, expect, test } from "vitest";

describe(toFishTagMap, () => {
  const FISH_ID = 1;
  const MONSTER_ID = 2;
  const TAG_GROUP_ID = 3;
  const TAG = 4;

  test("a fish's tags are the feature tag group its monster names, which need not be its own id", () => {
    expect.hasAssertions();

    const tags = toFishTagMap(
      [{ id: FISH_ID, monsterId: MONSTER_ID }],
      [{ featureTagGroupID: TAG_GROUP_ID, id: MONSTER_ID }],
      [{ groupID: TAG_GROUP_ID, tagIDs: [0, TAG] }],
    );

    expect(tags).toStrictEqual(new Map([[FISH_ID, new Set([TAG])]]));
  });
});
