// @vitest-environment nuxt
import { createUser } from "#src/services/message/user/createUser.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useAlertStore } from "#src/store/alert";
import { useFriendStore } from "#src/store/message/user/friend";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe(useFriendStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const first = createUser({ name: "first" });
  const second = createUser({ name: "second" });

  // Each friend is its own target, so two removals overlap on one list, and the failing one unwinds to the list the
  // Removal ahead of it left, whichever of the two was the one rejected
  test.each([first, second])("puts back only the friend whose removal was rejected: $name", async (failedFriend) => {
    expect.hasAssertions();

    trpcMsw.friend.deleteFriend.mutation(({ input: friendId }) => {
      if (friendId === failedFriend.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const alertStore = useAlertStore();
    const friendStore = useFriendStore();
    const { friends } = storeToRefs(friendStore);
    const { deleteFriend } = friendStore;
    friends.value = [first, second];
    deleteFriend(first.id);
    deleteFriend(second.id);
    await flushPromises();

    expect(friends.value).toStrictEqual([failedFriend]);
    expect(alertStore.alerts).toHaveLength(1);
  });

  // The accept echo reaches the accepting client as well as the accepted one, so the same friend arrives twice
  test("stores a repeated friend delivery once", () => {
    expect.hasAssertions();

    const friendStore = useFriendStore();
    const { friends } = storeToRefs(friendStore);
    const { storeCreateFriend } = friendStore;
    storeCreateFriend(first);
    storeCreateFriend(first);

    expect(friends.value).toStrictEqual([first]);
  });

  // A friend added or removed while the list is being read is not in the answer's favour: the answer may predate the
  // Push, so the push is replayed over it rather than the answer overwriting the list without it
  test("replays a removal and an addition that land during the read over its answer", async () => {
    expect.hasAssertions();

    const { $trpc } = useNuxtApp();
    const friendStore = useFriendStore();
    const { friends } = storeToRefs(friendStore);
    const added = createUser();
    const removed = createUser();
    trpcMsw.friend.readFriends.query(() => {
      friendStore.storeDeleteFriend(removed.id);
      friendStore.storeCreateFriend(added);
      return [first, removed];
    });
    await friendStore.readFriends(() => $trpc.friend.readFriends.query());

    expect(friends.value).toStrictEqual([first, added]);
  });
});
