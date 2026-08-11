// @vitest-environment nuxt
import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useBlockStore } from "@/store/message/user/block";
import { useFriendStore } from "@/store/message/user/friend";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useBlockStore, () => {
  const server = setupMswTrpc();
  const first = createUser({ name: "first" });
  const second = createUser({ name: "second" });

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Each blocked user is its own target, so two blocks overlap on the friend list. The failing one must put back
  // Only the friend it removed — reinstating the list resurrects the friend the block beside it already dropped
  test("puts back only the friend whose block was rejected", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.block.blockUser.mutation(({ input: targetUserId }) => {
        if (targetUserId === first.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
        return second;
      }),
    );
    const friendStore = useFriendStore();
    const { friends } = storeToRefs(friendStore);
    const blockStore = useBlockStore();
    const { blockUser } = blockStore;
    friends.value = [first, second];
    await Promise.all([blockUser(first.id), blockUser(second.id)]);

    expect(friends.value).toStrictEqual([first]);
  });

  // Same rule for the blocked list an unblock writes: only the user this write removed comes back
  test("puts back only the user whose unblock was rejected", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.block.unblockUser.mutation(({ input: blockedUserId }) => {
        if (blockedUserId === first.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });

        return blockedUserId;
      }),
    );
    const blockStore = useBlockStore();
    const { blockedUsers } = storeToRefs(blockStore);
    const { unblockUser } = blockStore;
    blockedUsers.value = [first, second];
    await Promise.all([unblockUser(first.id), unblockUser(second.id)]);

    expect(blockedUsers.value).toStrictEqual([first]);
  });

  // Blocking and unblocking one user are two writes to the same row, so they run one after the other. On an
  // Executor each they only read as if they did: the block landed while the unblock was still out, and the
  // Unblock's rollback then put its copy of the row back on top of the one the block had just added
  test("does not list a user twice when a rejected unblock overlaps a block", async () => {
    expect.hasAssertions();

    const { promise: unblockPromise, resolve: releaseUnblock } = Promise.withResolvers<void>();
    const unblockReleased = unblockPromise;
    server.use(
      trpcMsw.block.blockUser.mutation(() => first),
      trpcMsw.block.unblockUser.mutation(async () => {
        await unblockReleased;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const blockStore = useBlockStore();
    const { blockedUsers } = storeToRefs(blockStore);
    const { blockUser, unblockUser } = blockStore;
    blockedUsers.value = [first];
    const unblock = unblockUser(first.id);
    const block = blockUser(first.id);
    // Long enough for a block that was never held back to land, which is what the queue has to prevent
    await flushPromises();
    releaseUnblock();
    await Promise.all([unblock, block]);

    expect(blockedUsers.value).toStrictEqual([first]);
  });
});
