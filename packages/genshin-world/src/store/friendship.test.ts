import { useWorldFriendshipStore } from "#src/store/friendship";
import { startTestWorldFriendship } from "#src/store/friendship.fixture";
import { startTestWorldSession } from "#src/store/session.fixture";
import { describe, expect, test } from "vitest";

describe(useWorldFriendshipStore, () => {
  test("stopping the store forgets the levels and the namecards", () => {
    expect.hasAssertions();

    startTestWorldSession();
    const worldFriendshipStore = startTestWorldFriendship([{ exp: 0, level: 1 }]);
    worldFriendshipStore.stop();

    expect({
      friendshipLevels: worldFriendshipStore.friendshipLevels,
      friendshipNamecards: worldFriendshipStore.friendshipNamecards,
    }).toStrictEqual({ friendshipLevels: undefined, friendshipNamecards: [] });
  });
});
