import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { ClientThread } from "#src/models/message/ClientThread";
import type { Entry } from "#src/models/shared/overlay/Entry";

import { messageHolderRegistry } from "#src/services/message/messageHolderRegistry";
import { MessageHookMap } from "#src/services/message/MessageHookMap";
import { updateMessageCopy } from "#src/services/message/updateMessageCopy";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { createTable } from "#src/services/shared/overlay/createTable";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useRoomStore } from "#src/store/message/room/index";
import { useOverlayStore } from "#src/store/overlay";
import { threadFollowsInMessage } from "@esposter/db-schema";
import { getResultAsync, noop, Operation } from "@esposter/shared";

const threadFollowTable = createTable(threadFollowsInMessage);

const getThreadFollowRowKey = (
  roomId: string,
  threadRootId: ClientMessage["id"],
  userId: string,
): [string, number, string] => [roomId, threadRootId, userId];

// The member's decision about a thread, set over the row held for it, or over a row the client creates with no version yet.
// A decision is one row, so an unfollow is a row change, not a delete, and the server's row names the version it holds at
const getThreadFollowEntry =
  (roomId: string, threadRootId: ClientMessage["id"], userId: string, isUnfollowed: boolean, now: Date): Entry =>
  (view) => {
    const key = getThreadFollowRowKey(roomId, threadRootId, userId);
    const threadFollow = view.get(threadFollowTable, key);
    view.set(
      threadFollowTable,
      key,
      threadFollow
        ? { ...threadFollow, isUnfollowed }
        : { createdAt: now, deletedAt: null, isUnfollowed, roomId, threadRootId, updatedAt: now, userId },
    );
  };

export const useThreadFollowStore = defineStore("message/threadFollow", () => {
  const { $trpc } = useNuxtApp();
  const userId = useSessionUserId();
  const roomStore = useRoomStore();
  const readMessageCreators = useReadMessageCreators();
  const overlayStore = useOverlayStore();
  const { arrive, view, writeOptimistic } = overlayStore;
  // The follow rows the member holds, unfollowed ones included, so a read that lands late cannot list a thread again
  const threadFollows = view(threadFollowTable);
  // The message cache: each room's followed roots as the room's messages show them. A root is kept here, not as the
  // Drawer's list, so the list is only ever the follows that have a root in this cache
  const {
    data: followedRoots,
    getData: getFollowedRoots,
    setData: setFollowedRoots,
  } = useDataMap<ClientThread[]>(
    () => roomStore.currentRoomId,
    () => [],
  );
  // A followed root's row is its own copy, since the room may not hold its message, so it takes the room's changes here
  messageHolderRegistry.register((roomId, hold) => {
    hold(getFollowedRoots(roomId) ?? []);
  });
  MessageHookMap[Operation.Update].register((input) => {
    updateMessageCopy(
      getFollowedRoots(input.roomId)?.find(({ id }) => id === input.id),
      input,
    );
  });
  MessageHookMap[Operation.Delete].register(({ id, roomId }) => {
    const roots = getFollowedRoots(roomId);
    // A deleted root leaves the drawer's list. Its follow row stays, so an unfollow can still find the thread
    if (roots?.some((root) => root.id === id))
      setFollowedRoots(
        roomId,
        roots.filter((root) => root.id !== id),
      );
  });
  // The drawer's list: the live follows of the room on screen, newest root first, each drawn by its root. A follow whose
  // Root is not held yet is not listed, and a failed follow leaves no row, so it leaves the list with no rollback
  const followedThreads = computed(() => {
    const roomId = roomStore.currentRoomId;
    const roots = followedRoots.value;
    return threadFollows.value
      .filter((follow) => follow.roomId === roomId && follow.userId === userId.value && !follow.isUnfollowed)
      .toSorted((firstFollow, secondFollow) => secondFollow.threadRootId - firstFollow.threadRootId)
      .flatMap((follow) => {
        const root = roots.find(({ id }) => id === follow.threadRootId);
        return root ? [root] : [];
      });
  });
  // Cached per room rather than per session — the key is the roomId, and one response holds the room's follows and roots.
  // Every follow button in the room joins that one read rather than each issuing its own, so a caller handed nothing
  // Renders an unfollowed star for a thread the user follows. Untagged: nothing a resource write does changes who follows
  const { read: readFollowedThreads, refetch: refetchFollowedThreads } = useCachedRead(
    async (roomId) => {
      const { follows, threads } = await $trpc.message.readFollowedThreads.query({ roomId });
      const roomThreads = threads.map((thread) => ({ ...thread, roomId }));
      // A row is drawn only once its root's author is known, so the authors the roots name are read with the list, as a
      // Room's messages read theirs, and the list lands with them already known
      await readMessageCreators(roomId, roomThreads);
      return { follows, threads: roomThreads };
    },
    {
      onSuccess: ({ follows, threads }, roomId) => {
        for (const follow of follows) arrive(threadFollowTable, follow);
        setFollowedRoots(roomId, threads);
      },
    },
  );
  const checkIsFollowing = (roomId: string, threadRootId: ClientMessage["id"]) =>
    threadFollows.value.some(
      (follow) =>
        follow.roomId === roomId &&
        follow.threadRootId === threadRootId &&
        follow.userId === userId.value &&
        !follow.isUnfollowed,
    );
  // The drawer lists each followed root as a copy of its message. A caller holding that message has the follow draw it
  // In the drawer at once; one whose thread has not read its root yet has the drawer read again once the follow lands,
  // Since only the server can hand back the root then
  const followThread = (roomId: string, threadRootId: ClientMessage["id"], threadRoot?: ClientThread) => {
    const roots = getFollowedRoots(roomId) ?? [];
    if (threadRoot && !roots.some(({ id }) => id === threadRootId))
      setFollowedRoots(roomId, [...roots, { ...threadRoot }]);
    writeOptimistic(
      async () => {
        const follow = await $trpc.message.followThread.mutate({ roomId, threadRootId });
        if (!threadRoot) await getResultAsync(() => refetchFollowedThreads(roomId)).match(noop, createErrorAlert);
        return createRowResponse(threadFollowTable, follow);
      },
      { entry: getThreadFollowEntry(roomId, threadRootId, userId.value, false, new Date()), onError: createErrorAlert },
    );
  };
  const unfollowThread = (roomId: string, threadRootId: ClientMessage["id"]) => {
    writeOptimistic(
      async () => {
        const follow = await $trpc.message.unfollowThread.mutate({ roomId, threadRootId });
        return createRowResponse(threadFollowTable, follow);
      },
      { entry: getThreadFollowEntry(roomId, threadRootId, userId.value, true, new Date()), onError: createErrorAlert },
    );
  };

  return {
    checkIsFollowing,
    followedThreads,
    followThread,
    readFollowedThreads,
    refetchFollowedThreads,
    unfollowThread,
  };
});
