import type { ClientMessage } from "#src/models/message/ClientMessage";

import { messageHolderRegistry } from "#src/services/message/messageHolderRegistry";
import { MessageHookMap } from "#src/services/message/MessageHookMap";
import { getRestoredItems } from "#src/services/shared/getRestoredItems";
import { useRoomStore } from "#src/store/message/room/index";
import { ID_SEPARATOR, Operation } from "@esposter/shared";

export const useThreadFollowStore = defineStore("message/threadFollow", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const readMessageCreators = useReadMessageCreators();
  const { executeMutation } = useMutation();
  const {
    data: followedThreads,
    getData: getFollowedThreads,
    setData: setFollowedThreads,
  } = useDataMap<ClientMessage[]>(
    () => roomStore.currentRoomId,
    () => [],
  );
  // A followed root's row is its own copy, since the room may not hold its message, so it takes the room's changes here
  messageHolderRegistry.register((roomId, hold) => {
    hold(getFollowedThreads(roomId) ?? []);
  });
  MessageHookMap[Operation.Update].register((input) => {
    const followedRoot = getFollowedThreads(input.roomId)?.find(({ id }) => id === input.id);
    if (followedRoot) Object.assign(followedRoot, input);
  });
  MessageHookMap[Operation.Delete].register(({ id, roomId }) => {
    const roots = getFollowedThreads(roomId);
    // A deleted root leaves the drawer's list. Its follow state stays, so an unfollow can still find the thread
    if (roots?.some((root) => root.id === id))
      setFollowedThreads(
        roomId,
        roots.filter((root) => root.id !== id),
      );
  });
  // Follow-STATE source of truth: every followed root id, including threads whose root message was
  // Deleted. followedThreads above drops deleted roots for the drawer, so checkIsFollowing must read this
  // Instead — otherwise a followed thread with a deleted root looks unfollowed and can never be unfollowed.
  const { getData: getFollowedThreadRootIds, setData: setFollowedThreadRootIds } = useDataMap<ClientMessage["id"][]>(
    () => roomStore.currentRoomId,
    () => [],
  );
  // Cached per room rather than per session — the key is the roomId, and one response populates both maps
  // Declared above. Untagged: nothing a resource write does changes who follows which thread.
  // The gated read loads once per room, so the follow-state check is accurate without re-fetching on every
  // Thread open and every follow button in the room joins that one read rather than each issuing its own —
  // A caller handed nothing renders an unfollowed star for a thread the user follows
  const { read: readFollowedThreads, refetch: refetchFollowedThreads } = useCachedRead(
    async (roomId) => {
      const { threadRootIds, threads } = await $trpc.message.readFollowedThreads.query({ roomId });
      const roomThreads = threads.map((thread) => ({ ...thread, roomId }));
      // A row is drawn only once its root's author is known, so the authors the roots name are read with the list, as a
      // Room's messages read theirs, and the list lands with them already known
      await readMessageCreators(roomId, roomThreads);
      return { threadRootIds, threads: roomThreads };
    },
    {
      onSuccess: ({ threadRootIds, threads }, roomId) => {
        setFollowedThreads(roomId, threads);
        setFollowedThreadRootIds(roomId, threadRootIds);
      },
    },
  );
  const checkIsFollowing = (roomId: string, threadRootId: ClientMessage["id"]) =>
    Boolean(getFollowedThreadRootIds(roomId)?.includes(threadRootId));
  // Follow STATE only — the drawer's display list needs the server-resolved root message, which callers that
  // Merely learn about a follow (a reply auto-follows its thread server-side) do not hold.
  const storeFollowThread = (roomId: string, threadRootId: ClientMessage["id"]) => {
    const threadRootIds = getFollowedThreadRootIds(roomId) ?? [];
    if (threadRootIds.includes(threadRootId)) return;

    setFollowedThreadRootIds(roomId, [...threadRootIds, threadRootId]);
  };
  // The drawer lists each followed root as a copy of its message. A caller holding that message has the follow draw it
  // In the drawer at once; one whose thread has not read its root yet has the drawer read again once the follow lands,
  // Since only the server can hand back the root then. Exclusive per thread, so a second toggle while the first is out
  // Is dropped rather than flipping the follow back
  const followThread = (roomId: string, threadRootId: ClientMessage["id"], threadRoot?: ClientMessage) => {
    executeMutation(() => $trpc.message.followThread.mutate({ roomId, threadRootId }), {
      applyOptimistic: () => {
        const isFollowingBefore = checkIsFollowing(roomId, threadRootId);
        const isListedBefore = (getFollowedThreads(roomId) ?? []).some(({ id }) => id === threadRootId);
        storeFollowThread(roomId, threadRootId);
        if (threadRoot && !isListedBefore)
          setFollowedThreads(roomId, [...(getFollowedThreads(roomId) ?? []), { ...threadRoot }]);
        return () => {
          if (!isFollowingBefore)
            setFollowedThreadRootIds(
              roomId,
              (getFollowedThreadRootIds(roomId) ?? []).filter(
                (followedThreadRootId) => followedThreadRootId !== threadRootId,
              ),
            );
          if (threadRoot && !isListedBefore)
            setFollowedThreads(
              roomId,
              (getFollowedThreads(roomId) ?? []).filter(({ id }) => id !== threadRootId),
            );
        };
      },
      isExclusive: true,
      key: `${roomId}${ID_SEPARATOR}${threadRootId}`,
      reconcile: async () => {
        if (!threadRoot) await refetchFollowedThreads(roomId);
      },
    });
  };
  const unfollowThread = (roomId: string, threadRootId: ClientMessage["id"]) => {
    executeMutation(() => $trpc.message.unfollowThread.mutate({ roomId, threadRootId }), {
      applyOptimistic: () => {
        const followedRoots = getFollowedThreads(roomId) ?? [];
        const followedThreadRootIds = getFollowedThreadRootIds(roomId) ?? [];
        const unfollowedIndex = followedRoots.findIndex(({ id }) => id === threadRootId);
        const unfollowedRoot = followedRoots[unfollowedIndex];
        const isFollowingBefore = followedThreadRootIds.includes(threadRootId);
        setFollowedThreads(
          roomId,
          followedRoots.filter(({ id }) => id !== threadRootId),
        );
        setFollowedThreadRootIds(
          roomId,
          followedThreadRootIds.filter((followedThreadRootId) => followedThreadRootId !== threadRootId),
        );
        return () => {
          if (isFollowingBefore) storeFollowThread(roomId, threadRootId);
          if (unfollowedRoot)
            setFollowedThreads(
              roomId,
              getRestoredItems(getFollowedThreads(roomId) ?? [], unfollowedRoot, unfollowedIndex),
            );
        };
      },
      isExclusive: true,
      key: `${roomId}${ID_SEPARATOR}${threadRootId}`,
    });
  };

  return {
    checkIsFollowing,
    followedThreads,
    followThread,
    readFollowedThreads,
    refetchFollowedThreads,
    storeFollowThread,
    unfollowThread,
  };
});
