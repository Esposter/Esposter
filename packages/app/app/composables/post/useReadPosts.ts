import { usePostStore } from "@/store/post";

export const useReadPosts = async () => {
  const { $trpc } = useNuxtApp();
  const postStore = usePostStore();
  const { initializeCursorPaginationData, pushPostList } = postStore;
  const { hasMore, nextCursor } = storeToRefs(postStore);
  const readMorePosts = async (onComplete: () => void) => {
    try {
      const response = await $trpc.post.readPosts.query({ cursor: nextCursor.value });
      nextCursor.value = response.nextCursor;
      hasMore.value = response.hasMore;
      if (response.items.length === 0) return;
      pushPostList(...response.items);
    } finally {
      onComplete();
    }
  };

  initializeCursorPaginationData(await $trpc.post.readPosts.query());
  return readMorePosts;
};
