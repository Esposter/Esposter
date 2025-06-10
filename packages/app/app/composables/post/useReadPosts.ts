import { usePostStore } from "@/store/post";

export const useReadPosts = async () => {
  const { $trpc } = useNuxtApp();
  const postStore = usePostStore();
  const { initializeCursorPaginationData, pushPosts } = postStore;
  const { hasMore, nextCursor } = storeToRefs(postStore);
  const readMorePosts = async (onComplete: () => void) => {
    try {
      const {
        hasMore: newHasMore,
        items,
        nextCursor: newNextCursor,
      } = await $trpc.post.readPosts.query({ cursor: nextCursor.value });
      nextCursor.value = newNextCursor;
      hasMore.value = newHasMore;
      pushPosts(...items);
    } finally {
      onComplete();
    }
  };

  initializeCursorPaginationData(await $trpc.post.readPosts.query());
  return readMorePosts;
};
