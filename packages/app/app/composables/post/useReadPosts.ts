import { usePostStore } from "@/store/post";

export const useReadPosts = async () => {
  const { $trpc } = useNuxtApp();
  const postStore = usePostStore();
  const { initializeCursorPaginationData, pushPosts } = postStore;
  const { hasMore, nextCursor } = storeToRefs(postStore);
  const readMorePosts = async (onComplete: () => void) => {
    try {
      const response = await $trpc.post.readPosts.query({ cursor: nextCursor.value });
      nextCursor.value = response.nextCursor;
      hasMore.value = response.hasMore;
      pushPosts(...response.items);
    } finally {
      onComplete();
    }
  };

  initializeCursorPaginationData(await $trpc.post.readPosts.query());
  return readMorePosts;
};
