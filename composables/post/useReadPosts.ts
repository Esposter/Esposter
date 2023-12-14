import { usePostStore } from "@/store/post";

export const useReadPosts = async () => {
  const { $client } = useNuxtApp();
  const postStore = usePostStore();
  const { initialiseCursorPaginationData, pushPosts } = postStore;
  const { nextCursor, hasMore } = storeToRefs(postStore);
  const readMorePosts = async (onComplete: () => void) => {
    try {
      const response = await $client.post.readPosts.query({ cursor: nextCursor.value });
      pushPosts(response.items);
      nextCursor.value = response.nextCursor;
      hasMore.value = response.hasMore;
    } finally {
      onComplete();
    }
  };

  initialiseCursorPaginationData(await $client.post.readPosts.query());
  return readMorePosts;
};
