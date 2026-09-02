// @vitest-environment nuxt
import type { ReadFollowedThreadsResult } from "#shared/models/message/thread/ReadFollowedThreadsResult";

import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useThreadFollowStore } from "@/store/message/threadFollow";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useThreadFollowStore, () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const threadRootRowKey = "threadRootRowKey";

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Every follow button in the room asks on mount, so the read is issued once — and the buttons that joined it
  // Have to see the follow state, or they render an unfollowed star for a thread the user follows
  test("hands every concurrent caller the follow state from one read", async () => {
    expect.hasAssertions();

    const handler = vi.fn<() => ReadFollowedThreadsResult>(() => ({
      threadRootRowKeys: [threadRootRowKey],
      threads: [],
    }));
    server.use(trpcMsw.message.readFollowedThreads.query(handler));
    const threadFollowStore = useThreadFollowStore();
    const { checkIsFollowing, ensureFollowedThreadsLoaded } = threadFollowStore;
    const inFlightLoad = ensureFollowedThreadsLoaded(roomId);
    await ensureFollowedThreadsLoaded(roomId);
    const isFollowingAfterJoinedLoad = checkIsFollowing(roomId, threadRootRowKey);
    await inFlightLoad;
    await ensureFollowedThreadsLoaded(roomId);

    expect(isFollowingAfterJoinedLoad).toBe(true);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
