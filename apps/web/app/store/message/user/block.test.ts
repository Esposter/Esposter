// @vitest-environment nuxt
import type { BlockInSocialWithRelations, FriendInSocialWithRelations } from "@esposter/db-schema";

import { useSession } from "#src/services/auth/authClient.test";
import { createFriend } from "#src/services/message/user/createFriend.test";
import { createFriendRequest } from "#src/services/message/user/createFriendRequest.test";
import { createUser } from "#src/services/message/user/createUser.test";
import { blockTable, friendRequestTable, friendTable } from "#src/services/message/user/pair/constants";
import { appendRowVersions } from "#src/services/trpc/appendRowVersions.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useBlockStore } from "#src/store/message/user/block";
import { useFriendStore } from "#src/store/message/user/friend";
import { useFriendRequestStore } from "#src/store/message/user/friendRequest";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

interface MockSessionValue {
  data?: undefined | { user: { id: string } };
}

describe(useBlockStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const appUser = createUser({ name: "appUser" });
  const first = createUser({ name: "first" });
  const second = createUser({ name: "second" });
  const added = createUser({ name: "added" });
  const createBlockPath = "block.createBlock";
  const deleteBlockPath = "block.deleteBlock";
  const trpcError = new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
  // The block rows the read answers with: each one a block the app user made, the blocked user included
  const createBlockRow = (blocked: typeof first, deletedAt: Date | null = null) => ({
    blocked,
    blockedId: blocked.id,
    blockerId: appUser.id,
    createdAt: new Date(0),
    deletedAt,
    updatedAt: new Date(0),
    version: 0,
  });
  const secondBlockRowVersion = {
    key: { blockedId: second.id, blockerId: appUser.id },
    table: blockTable.name,
    version: 1,
  };

  const seedFriends = async (friendships: FriendInSocialWithRelations[]) => {
    const { $trpc } = useNuxtApp();
    trpcMsw.friend.readFriends.query(() => friendships);
    const friendStore = useFriendStore();
    const { readFriends } = friendStore;
    await readFriends(() => $trpc.friend.readFriends.query());
  };

  const seedBlocks = async (blocks: BlockInSocialWithRelations[]) => {
    const { $trpc } = useNuxtApp();
    trpcMsw.block.readBlockedUsers.query(() => blocks);
    const blockStore = useBlockStore();
    const { readBlockedUsers } = blockStore;
    await readBlockedUsers(() => $trpc.block.readBlockedUsers.query());
  };

  beforeEach(() => {
    useSession.mockReturnValue(ref<MockSessionValue>({ data: { user: { id: appUser.id } } }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Each blocked user is its own target, so two blocks overlap on the friend list and the failing one keeps its friend
  test("keeps only the friend whose block was rejected", async () => {
    expect.hasAssertions();

    trpcMsw.block.createBlock.mutation(({ ctx, input: targetUserId }) => {
      if (targetUserId === first.id) throw trpcError;

      appendRowVersions(ctx.responseHeaders, createBlockPath, [
        { key: { receiverId: second.id, senderId: appUser.id }, table: friendTable.name, version: 1 },
        secondBlockRowVersion,
      ]);
      return second;
    });
    const friendStore = useFriendStore();
    const { friends } = storeToRefs(friendStore);
    const blockStore = useBlockStore();
    const { createBlock } = blockStore;
    await seedFriends([createFriend(appUser, first), createFriend(appUser, second)]);
    createBlock(first.id);
    createBlock(second.id);
    await flushPromises();

    expect(friends.value).toStrictEqual([first]);
  });

  // Same rule for the blocked list an unblock writes: only the user this write removed leaves the list
  test("keeps only the user whose unblock was rejected", async () => {
    expect.hasAssertions();

    trpcMsw.block.deleteBlock.mutation(({ ctx, input: blockedUserId }) => {
      if (blockedUserId === first.id) throw trpcError;

      appendRowVersions(ctx.responseHeaders, deleteBlockPath, [secondBlockRowVersion]);
      return blockedUserId;
    });
    const blockStore = useBlockStore();
    const { blockedUsers } = storeToRefs(blockStore);
    const { deleteBlock } = blockStore;
    await seedBlocks([createBlockRow(first), createBlockRow(second)]);
    deleteBlock(first.id);
    deleteBlock(second.id);
    await flushPromises();

    expect(blockedUsers.value).toStrictEqual([first]);
  });

  // Blocking and unblocking one user write the same block row, so the block queues behind the unblock. The block's answer
  // Holds the row live again, so the user is listed once, and the rejected unblock drops its entry without undoing it
  test("does not list a user twice when a rejected unblock overlaps a block", async () => {
    expect.hasAssertions();

    const { promise: unblockReleased, resolve: releaseUnblock } = Promise.withResolvers<void>();
    trpcMsw.block.deleteBlock.mutation(async () => {
      await unblockReleased;
      throw trpcError;
    });
    trpcMsw.block.createBlock.mutation(({ ctx }) => {
      appendRowVersions(ctx.responseHeaders, createBlockPath, [
        { key: { blockedId: first.id, blockerId: appUser.id }, table: blockTable.name, version: 1 },
      ]);
      return first;
    });
    const blockStore = useBlockStore();
    const { blockedUsers } = storeToRefs(blockStore);
    const { createBlock, deleteBlock } = blockStore;
    await seedBlocks([createBlockRow(first)]);
    deleteBlock(first.id);
    createBlock(first.id);
    await flushPromises();
    releaseUnblock();
    await flushPromises();

    expect(blockedUsers.value).toStrictEqual([first]);
  });

  // A block removes the pending requests between the two users, as a decline does, so the two queue on the pair. The
  // Decline runs after the block that rejects, and its answer names the request it removed, so the request stays off
  // The received list
  test("a rejected block does not bring back a request a decline removed", async () => {
    expect.hasAssertions();

    const { promise: blockReleased, resolve: releaseBlock } = Promise.withResolvers<void>();
    trpcMsw.block.createBlock.mutation(async () => {
      await blockReleased;
      throw trpcError;
    });
    trpcMsw.friendRequest.declineFriendRequest.mutation(({ ctx }) => {
      appendRowVersions(ctx.responseHeaders, "friendRequest.declineFriendRequest", [
        { key: { receiverId: appUser.id, senderId: first.id }, table: friendRequestTable.name, version: 1 },
      ]);
    });
    const friendRequestStore = useFriendRequestStore();
    const { receivedFriendRequests } = storeToRefs(friendRequestStore);
    const { declineFriendRequest, readFriendRequests } = friendRequestStore;
    const blockStore = useBlockStore();
    const { createBlock } = blockStore;
    const { $trpc } = useNuxtApp();
    trpcMsw.friendRequest.readFriendRequests.query(() => [createFriendRequest(first, appUser)]);
    await readFriendRequests(() => $trpc.friendRequest.readFriendRequests.query());
    createBlock(first.id);
    declineFriendRequest(first.id);
    releaseBlock();
    await flushPromises();

    expect(receivedFriendRequests.value).toStrictEqual([]);
  });

  // A block and an unblock made while the blocked list is read are not in the answer's favour: the answer may predate
  // Them, so the entries they wrote keep showing over it
  test("keeps a block and an unblock made while the blocked list is read", async () => {
    expect.hasAssertions();

    const { $trpc } = useNuxtApp();
    trpcMsw.block.createBlock.mutation(({ ctx }) => {
      appendRowVersions(ctx.responseHeaders, createBlockPath, [
        { key: { blockedId: added.id, blockerId: appUser.id }, table: blockTable.name, version: 1 },
      ]);
      return added;
    });
    trpcMsw.block.deleteBlock.mutation(({ ctx, input: blockedUserId }) => {
      appendRowVersions(ctx.responseHeaders, deleteBlockPath, [
        { key: { blockedId: blockedUserId, blockerId: appUser.id }, table: blockTable.name, version: 1 },
      ]);
      return blockedUserId;
    });
    const blockStore = useBlockStore();
    const { blockedUsers } = storeToRefs(blockStore);
    const { createBlock, deleteBlock, readBlockedUsers } = blockStore;
    await seedBlocks([createBlockRow(second)]);
    const { promise: readAnswered, resolve: releaseRead } = Promise.withResolvers<void>();
    trpcMsw.block.readBlockedUsers.query(async () => {
      await readAnswered;
      return [createBlockRow(second)];
    });
    const read = readBlockedUsers(() => $trpc.block.readBlockedUsers.query());
    createBlock(added.id);
    deleteBlock(second.id);
    await flushPromises();
    releaseRead();
    await read;

    expect(blockedUsers.value).toStrictEqual([added]);
  });
});
