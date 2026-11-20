// @vitest-environment nuxt
import { setupSession } from "#src/services/auth/setupSession.test";
import { createFriend } from "#src/services/message/user/createFriend.test";
import { createUser } from "#src/services/message/user/createUser.test";
import { blockTable, friendTable } from "#src/services/message/user/pair/constants";
import { seedFriends } from "#src/services/message/user/seedFriends.test";
import { appendRowVersions } from "#src/services/trpc/appendRowVersions.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useAlertStore } from "#src/store/alert";
import { useBlockStore } from "#src/store/message/user/block";
import { useFriendStore } from "#src/store/message/user/friend";
import { getFriendshipId } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(useFriendStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const appUser = createUser({ name: "appUser" });
  const first = createUser({ name: "first" });
  const second = createUser({ name: "second" });
  const firstFriend = createFriend(appUser, first);
  const trpcError = new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
  setupSession(appUser.id);
  // The row an unfriend answers with: the friendship between the app user and the friend, tombstoned at the version its
  // Removal left
  const createRemovedFriendship = (friendId: string) => ({
    createdAt: new Date(0),
    deletedAt: new Date(0),
    id: getFriendshipId(appUser.id, friendId),
    receiverId: friendId,
    senderId: appUser.id,
    updatedAt: new Date(0),
    version: 1,
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Each friend is its own target, so two removals overlap on one list, and the failing one is the friend that stays
  test.each([first, second])("keeps only the friend whose removal was rejected: $name", async (failedFriend) => {
    expect.hasAssertions();

    trpcMsw.friend.deleteFriend.mutation(({ input: friendId }) => {
      if (friendId === failedFriend.id) throw trpcError;

      return createRemovedFriendship(friendId);
    });
    const alertStore = useAlertStore();
    const friendStore = useFriendStore();
    const { friends } = storeToRefs(friendStore);
    const { deleteFriend } = friendStore;
    await seedFriends(trpcMsw, [firstFriend, createFriend(appUser, second)]);
    deleteFriend(first.id);
    deleteFriend(second.id);
    await flushPromises();

    expect(friends.value).toStrictEqual([failedFriend]);
    expect(alertStore.alerts).toHaveLength(1);
  });

  // An unfriend and a block of one user write the same friendship row, so the block queues behind the unfriend. Its
  // Answer names the friendship it tombstoned, so the block's entry keeps the friend off the list after the rejected
  // Unfriend has dropped its own entry
  test("a rejected unfriend does not bring back a friend a block removed", async () => {
    expect.hasAssertions();

    const { promise: unfriendReleased, resolve: releaseUnfriend } = Promise.withResolvers<void>();
    trpcMsw.friend.deleteFriend.mutation(async () => {
      await unfriendReleased;
      throw trpcError;
    });
    trpcMsw.block.createBlock.mutation(({ ctx, path }) => {
      appendRowVersions(ctx.responseHeaders, path, [
        { key: { receiverId: first.id, senderId: appUser.id }, table: friendTable.name, version: 1 },
        { key: { blockedId: first.id, blockerId: appUser.id }, table: blockTable.name, version: 1 },
      ]);
      return first;
    });
    const friendStore = useFriendStore();
    const { friends } = storeToRefs(friendStore);
    const { deleteFriend } = friendStore;
    const blockStore = useBlockStore();
    const { createBlock } = blockStore;
    await seedFriends(trpcMsw, [firstFriend]);
    deleteFriend(first.id);
    createBlock(first.id);
    await flushPromises();
    releaseUnfriend();
    await flushPromises();

    expect(friends.value).toStrictEqual([]);
  });

  // The server answers a repeated delivery with the row it already sent, which the arrival gate discards
  test("stores a repeated friend delivery once", async () => {
    expect.hasAssertions();

    const friendStore = useFriendStore();
    const { friends } = storeToRefs(friendStore);
    await seedFriends(trpcMsw, [firstFriend, firstFriend]);

    expect(friends.value).toStrictEqual([first]);
  });

  // A read taken before a removal answers with the friendship still live. The removal's answer lands first at a higher
  // Version, so the read's older copy is discarded and the removed friend stays off the list
  test("a read answered before a removal does not bring the removed friend back", async () => {
    expect.hasAssertions();

    const { $trpc } = useNuxtApp();
    await seedFriends(trpcMsw, [firstFriend]);
    const { promise: readAnswered, resolve: releaseRead } = Promise.withResolvers<void>();
    trpcMsw.friend.readFriends.query(async () => {
      await readAnswered;
      return [firstFriend];
    });
    trpcMsw.friend.deleteFriend.mutation(({ input: friendId }) => createRemovedFriendship(friendId));
    const friendStore = useFriendStore();
    const { friends } = storeToRefs(friendStore);
    const { deleteFriend, readFriends } = friendStore;
    const read = readFriends(() => $trpc.friend.readFriends.query());
    deleteFriend(first.id);
    await flushPromises();
    releaseRead();
    await read;

    expect(friends.value).toStrictEqual([]);
  });
});
