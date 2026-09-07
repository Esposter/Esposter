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

  // Each blocked user is its own target, so two blocks overlap on the friend list and the failing one must put
  // Back only the friend it removed
  test("puts back only the friend whose block was rejected", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.block.createBlock.mutation(({ input: targetUserId }) => {
        if (targetUserId === first.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
        return second;
      }),
    );
    const friendStore = useFriendStore();
    const { friends } = storeToRefs(friendStore);
    const blockStore = useBlockStore();
    const { createBlock } = blockStore;
    friends.value = [first, second];
    await Promise.all([createBlock(first.id), createBlock(second.id)]);

    expect(friends.value).toStrictEqual([first]);
  });

  // Same rule for the blocked list an unblock writes: only the user this write removed comes back
  test("puts back only the user whose unblock was rejected", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.block.deleteBlock.mutation(({ input: blockedUserId }) => {
        if (blockedUserId === first.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });

        return blockedUserId;
      }),
    );
    const blockStore = useBlockStore();
    const { blockedUsers } = storeToRefs(blockStore);
    const { deleteBlock } = blockStore;
    blockedUsers.value = [first, second];
    await Promise.all([deleteBlock(first.id), deleteBlock(second.id)]);

    expect(blockedUsers.value).toStrictEqual([first]);
  });

  // Blocking and unblocking one user are two writes to the same row, so they run one after the other. On an
  // Executor each they only read as if they did: the block landed while the unblock was still out, and the
  // Unblock's rollback then put its copy of the row back on top of the one the block had just added
  test("does not list a user twice when a rejected unblock overlaps a block", async () => {
    expect.hasAssertions();

    const { promise: unblockReleased, resolve: releaseUnblock } = Promise.withResolvers<void>();
    server.use(
      trpcMsw.block.createBlock.mutation(() => first),
      trpcMsw.block.deleteBlock.mutation(async () => {
        await unblockReleased;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const blockStore = useBlockStore();
    const { blockedUsers } = storeToRefs(blockStore);
    const { createBlock, deleteBlock } = blockStore;
    blockedUsers.value = [first];
    const unblock = deleteBlock(first.id);
    const block = createBlock(first.id);
    // Long enough for a block that was never held back to land, which is what the queue has to prevent
    await flushPromises();
    releaseUnblock();
    await Promise.all([unblock, block]);

    expect(blockedUsers.value).toStrictEqual([first]);
  });
});
