import type { StandardMessageEntity } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";

export const useThreadFollowStore = defineStore("message/threadFollow", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const {
    data: followedThreads,
    getData: getFollowedThreads,
    setData: setFollowedThreads,
  } = useDataMap<StandardMessageEntity[]>(
    () => roomStore.currentRoomId,
    () => [],
  );
  const loadedRoomIds = reactive(new Set<string>());
  const loadingPromises = new Map<string, Promise<void>>();

  const readFollowedThreads = async (roomId: string) => {
    const threads = await $trpc.message.readFollowedThreads.query({ roomId });
    setFollowedThreads(roomId, threads);
    loadedRoomIds.add(roomId);
  };
  // Load once per room so the follow-state check is accurate without re-fetching on every thread open.
  // Concurrent callers (follow button, threads drawer) share the in-flight promise instead of re-querying.
  const ensureFollowedThreadsLoaded = async (roomId: string) => {
    if (loadedRoomIds.has(roomId)) return;

    let loadingPromise = loadingPromises.get(roomId);
    if (!loadingPromise) {
      loadingPromise = readFollowedThreads(roomId).finally(() => {
        loadingPromises.delete(roomId);
      });
      loadingPromises.set(roomId, loadingPromise);
    }
    await loadingPromise;
  };
  const checkIsFollowing = (roomId: string, threadRootRowKey: StandardMessageEntity["rowKey"]) =>
    Boolean(getFollowedThreads(roomId)?.some(({ rowKey }) => rowKey === threadRootRowKey));
  const followThread = async (roomId: string, threadRootRowKey: StandardMessageEntity["rowKey"]) => {
    await $trpc.message.followThread.mutate({ roomId, threadRootRowKey });
    await readFollowedThreads(roomId);
  };
  const unfollowThread = async (roomId: string, threadRootRowKey: StandardMessageEntity["rowKey"]) => {
    await $trpc.message.unfollowThread.mutate({ roomId, threadRootRowKey });
    setFollowedThreads(
      roomId,
      (getFollowedThreads(roomId) ?? []).filter(({ rowKey }) => rowKey !== threadRootRowKey),
    );
  };

  return {
    checkIsFollowing,
    ensureFollowedThreadsLoaded,
    followedThreads,
    followThread,
    readFollowedThreads,
    unfollowThread,
  };
});
