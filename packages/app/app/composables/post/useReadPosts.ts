import { usePostStore } from "@/store/post";

export const useReadPosts = async () => {
  const { $client } = useNuxtApp();
  const postStore = usePostStore();
  const { initializeCursorPaginationData, pushPostList } = postStore;
  const { hasMore, nextCursor } = storeToRefs(postStore);
  const readMorePosts = async (onComplete: () => void) => {
    try {
      const response = await $client.post.readPosts.query({ cursor: nextCursor.value });
      pushPostList(...response.items);
      nextCursor.value = response.nextCursor;
      hasMore.value = response.hasMore;
    } finally {
      onComplete();
    }
  };

  initializeCursorPaginationData(await $client.post.readPosts.query());
  return readMorePosts;
};
