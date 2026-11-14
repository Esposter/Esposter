import type { ClientMessage } from "@/models/message/ClientMessage";

import { useRoomStore } from "@/store/message/room";

export const useThreadFollowStore = defineStore("message/threadFollow", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const readMessageCreators = useReadMessageCreators();
  const {
    data: followedThreads,
    getData: getFollowedThreads,
    setData: setFollowedThreads,
  } = useDataMap<ClientMessage[]>(
    () => roomStore.currentRoomId,
    () => [],
  );
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
      const followedThreadsResult = await $trpc.message.readFollowedThreads.query({ roomId });
      // A row is drawn only once its root's author is known, so the authors the roots name are read with the list, as a
      // Room's messages read theirs, and the list lands with them already known
      await readMessageCreators(roomId, followedThreadsResult.threads);
      return followedThreadsResult;
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
  const followThread = async (roomId: string, threadRootId: ClientMessage["id"]) => {
    await $trpc.message.followThread.mutate({ roomId, threadRootId });
    // Re-read rather than mirror locally: the drawer lists the root message, which only the server resolves.
    await refetchFollowedThreads(roomId);
  };
  const unfollowThread = async (roomId: string, threadRootId: ClientMessage["id"]) => {
    await $trpc.message.unfollowThread.mutate({ roomId, threadRootId });
    setFollowedThreads(
      roomId,
      (getFollowedThreads(roomId) ?? []).filter(({ id }) => id !== threadRootId),
    );
    setFollowedThreadRootIds(
      roomId,
      (getFollowedThreadRootIds(roomId) ?? []).filter((followedThreadRootId) => followedThreadRootId !== threadRootId),
    );
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
