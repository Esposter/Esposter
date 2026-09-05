// @vitest-environment nuxt
import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useAlertStore } from "@/store/alert";
import { useFriendStore } from "@/store/message/user/friend";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useFriendStore, () => {
  const server = setupMswTrpc();
  const first = createUser({ name: "first" });
  const second = createUser({ name: "second" });

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Each friend is its own target, so two removals overlap on one list and the failing one has to unwind to the
  // List the removal ahead of it left, not to the one the user was looking at when they clicked
  test("rolls a failed removal back to the list the removal ahead of it left", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.friend.deleteFriend.mutation(({ input: friendId }) => {
        if (friendId === second.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const alertStore = useAlertStore();
    const friendStore = useFriendStore();
    const { friends } = storeToRefs(friendStore);
    const { deleteFriend } = friendStore;
    friends.value = [first, second];
    await Promise.all([deleteFriend(first.id), deleteFriend(second.id)]);

    expect(friends.value).toStrictEqual([second]);
    expect(alertStore.alerts).toHaveLength(1);
  });

  // The failing removal is the one that applied first, so its rollback lands after the other has persisted
  test("puts back only the friend whose removal was rejected", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.friend.deleteFriend.mutation(({ input: friendId }) => {
        if (friendId === first.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const friendStore = useFriendStore();
    const { friends } = storeToRefs(friendStore);
    const { deleteFriend } = friendStore;
    friends.value = [first, second];
    await Promise.all([deleteFriend(first.id), deleteFriend(second.id)]);

    expect(friends.value).toStrictEqual([first]);
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
});
