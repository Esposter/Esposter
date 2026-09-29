// @vitest-environment nuxt
import type { ReadFollowedThreadsResult } from "#shared/models/message/thread/ReadFollowedThreadsResult";

import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useThreadFollowStore } from "@/store/message/threadFollow";
import { describe, expect, test, vi } from "vitest";

describe(useThreadFollowStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const threadRootRowKey = crypto.randomUUID();

  // Every follow button in the room asks on mount, so the read is issued once — and the buttons that joined it
  // Have to see the follow state, or they render an unfollowed star for a thread the user follows
  test("hands every concurrent caller the follow state from one read", async () => {
    expect.hasAssertions();

    const handler = vi.fn<() => ReadFollowedThreadsResult>(() => ({
      threadRootRowKeys: [threadRootRowKey],
      threads: [],
    }));
    trpcMsw.message.readFollowedThreads.query(handler);
    const threadFollowStore = useThreadFollowStore();
    const { checkIsFollowing, readFollowedThreads } = threadFollowStore;
    const inFlightLoad = readFollowedThreads(roomId);
    await readFollowedThreads(roomId);
    const isFollowingAfterJoinedLoad = checkIsFollowing(roomId, threadRootRowKey);
    await inFlightLoad;
    await readFollowedThreads(roomId);

    expect(isFollowingAfterJoinedLoad).toBe(true);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
