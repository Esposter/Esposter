// @vitest-environment nuxt
import type { ReadFollowedThreadsResult } from "#shared/models/message/thread/ReadFollowedThreadsResult";

import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useThreadFollowStore } from "@/store/message/threadFollow";
import { createMessageEntity, getReverseTickedTimestamp, MessageType } from "@esposter/db-schema";
import { describe, expect, test, vi } from "vitest";

describe(useThreadFollowStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const threadRootRowKey = getReverseTickedTimestamp();

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

  // A row is drawn only for a thread whose root's author is known, so the list lands with that author read
  test("reads each followed thread's root author with the list, so the thread's creator is known when it is drawn", async () => {
    expect.hasAssertions();

    const author = createUser();
    const thread = createMessageEntity({ roomId, type: MessageType.Message, userId: author.id });
    trpcMsw.message.readFollowedThreads.query(() => ({ threadRootRowKeys: [thread.rowKey], threads: [thread] }));
    trpcMsw.room.readUsersByIds.query(() => [{ ...author, displayName: "displayName", isMember: true }]);
    const threadFollowStore = useThreadFollowStore();
    const { readFollowedThreads } = threadFollowStore;
    const creator = useCreator(() => thread);
    await readFollowedThreads(roomId);

    expect(creator.value?.id).toBe(author.id);
  });
});
