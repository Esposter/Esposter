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
  // Follow-STATE source of truth: every followed root rowKey, including threads whose root message was
  // Deleted. followedThreads above drops deleted roots for the drawer, so checkIsFollowing must read this
  // Instead — otherwise a followed thread with a deleted root looks unfollowed and can never be unfollowed.
  const { getData: getFollowedThreadRootRowKeys, setData: setFollowedThreadRootRowKeys } = useDataMap<
    StandardMessageEntity["rowKey"][]
  >(
    () => roomStore.currentRoomId,
    () => [],
  );
  const loadedRoomIds = reactive(new Set<string>());
  const loadingPromises = new Map<string, Promise<void>>();

  const readFollowedThreads = async (roomId: string) => {
    const [threads, threadRootRowKeys] = await Promise.all([
      $trpc.message.readFollowedThreads.query({ roomId }),
      $trpc.message.readFollowedThreadRootRowKeys.query({ roomId }),
    ]);
    setFollowedThreads(roomId, threads);
    setFollowedThreadRootRowKeys(roomId, threadRootRowKeys);
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
    Boolean(getFollowedThreadRootRowKeys(roomId)?.includes(threadRootRowKey));
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
    setFollowedThreadRootRowKeys(
      roomId,
      (getFollowedThreadRootRowKeys(roomId) ?? []).filter((rowKey) => rowKey !== threadRootRowKey),
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
