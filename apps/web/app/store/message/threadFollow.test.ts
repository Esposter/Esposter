// @vitest-environment nuxt
import type { ReadFollowedThreadsResult } from "#shared/models/message/thread/ReadFollowedThreadsResult";

import { createOptimisticMessage } from "#src/services/message/createOptimisticMessage";
import { MessageHookMap } from "#src/services/message/MessageHookMap";
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { createUser } from "#src/services/message/user/createUser.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useThreadFollowStore } from "#src/store/message/threadFollow";
import { MessageType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useThreadFollowStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const threadRootId = 1;
  const userId = v7();
  const root = { ...createOptimisticMessage({ roomId, type: MessageType.Message }, userId), id: threadRootId };

  beforeEach(() => {
    setCurrentRoomId(roomId);
  });

  // A followed root is a copy of the room's message, so the followed list takes the room's edits and deletions
  // The follow itself is kept when its root is deleted, since the unfollow still has to find the thread
  test("drops a deleted followed root from the list and keeps the follow", async () => {
    expect.hasAssertions();

    trpcMsw.message.readFollowedThreads.query(() => ({ threadRootIds: [threadRootId], threads: [root] }));
    trpcMsw.room.readUsersByIds.query(() => []);
    const threadFollowStore = useThreadFollowStore();
    const { checkIsFollowing, readFollowedThreads } = threadFollowStore;
    const { followedThreads } = storeToRefs(threadFollowStore);
    await readFollowedThreads(roomId);
    await MessageHookMap[Operation.Delete].run({ id: threadRootId, roomId });

    expect(followedThreads.value).toStrictEqual([]);
    expect(checkIsFollowing(roomId, threadRootId)).toBe(true);
  });

  test("takes an edit to a followed root", async () => {
    expect.hasAssertions();

    trpcMsw.message.readFollowedThreads.query(() => ({ threadRootIds: [threadRootId], threads: [root] }));
    trpcMsw.room.readUsersByIds.query(() => []);
    const threadFollowStore = useThreadFollowStore();
    const { readFollowedThreads } = threadFollowStore;
    const { followedThreads } = storeToRefs(threadFollowStore);
    await readFollowedThreads(roomId);
    await MessageHookMap[Operation.Update].run({ id: threadRootId, message: "edited", roomId });

    expect(followedThreads.value[0]?.message).toBe("edited");
  });

  // Every follow button in the room asks on mount, so the read is issued once — and the buttons that joined it
  // Have to see the follow state, or they render an unfollowed star for a thread the user follows
  test("hands every concurrent caller the follow state from one read", async () => {
    expect.hasAssertions();

    const handler = vi.fn<() => ReadFollowedThreadsResult>(() => ({ threadRootIds: [threadRootId], threads: [] }));
    trpcMsw.message.readFollowedThreads.query(handler);
    const threadFollowStore = useThreadFollowStore();
    const { checkIsFollowing, readFollowedThreads } = threadFollowStore;
    const inFlightLoad = readFollowedThreads(roomId);
    await readFollowedThreads(roomId);
    const isFollowingAfterJoinedLoad = checkIsFollowing(roomId, threadRootId);
    await inFlightLoad;
    await readFollowedThreads(roomId);

    expect(isFollowingAfterJoinedLoad).toBe(true);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  // A row is drawn only for a thread whose root's author is known, so the list lands with that author read
  test("reads each followed thread's root author with the list, so the thread's creator is known when it is drawn", async () => {
    expect.hasAssertions();

    const author = createUser();
    const thread = createOptimisticMessage({ roomId, type: MessageType.Message }, author.id);
    trpcMsw.message.readFollowedThreads.query(() => ({ threadRootIds: [thread.id], threads: [thread] }));
    trpcMsw.room.readUsersByIds.query(() => [{ ...author, displayName: "displayName", isMember: true }]);
    const threadFollowStore = useThreadFollowStore();
    const { readFollowedThreads } = threadFollowStore;
    const creator = useCreator(() => thread);
    await readFollowedThreads(roomId);

    expect(creator.value?.id).toBe(author.id);
  });
});
