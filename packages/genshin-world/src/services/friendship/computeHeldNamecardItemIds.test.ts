import { computeHeldNamecardItemIds } from "#src/services/friendship/computeHeldNamecardItemIds";
import { readFriendshipLevels } from "#src/services/friendship/readFriendshipLevels";
import { readFriendshipNamecards } from "#src/services/friendship/readFriendshipNamecards";
import { describe, expect, test } from "vitest";

describe(computeHeldNamecardItemIds, () => {
  const AMBER_CHARACTER_ID = 10000021;
  const AMBER_NAMECARD_ITEM_ID = 210003;
  const AMBER_LEVEL_10_EXP = 29100;

  test("should hold Amber's namecard at Friendship Level 10 and not one EXP below it", async () => {
    expect.hasAssertions();

    const friendshipLevels = await readFriendshipLevels();
    const namecards = await readFriendshipNamecards();

    expect(
      computeHeldNamecardItemIds(
        namecards,
        [{ friendshipExp: AMBER_LEVEL_10_EXP, id: AMBER_CHARACTER_ID }],
        friendshipLevels,
      ),
    ).toStrictEqual([AMBER_NAMECARD_ITEM_ID]);
    expect(
      computeHeldNamecardItemIds(
        namecards,
        [{ friendshipExp: AMBER_LEVEL_10_EXP - 1, id: AMBER_CHARACTER_ID }],
        friendshipLevels,
      ),
    ).toStrictEqual([]);
  });
});
