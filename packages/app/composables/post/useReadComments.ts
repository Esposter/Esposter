import { useCommentStore } from "@/store/post/comment";

export const useReadComments = async (postId: string) => {
  const { $client } = useNuxtApp();
  const commentStore = useCommentStore();
  const { initializeCursorPaginationData, pushCommentList } = commentStore;
  const { hasMore, nextCursor } = storeToRefs(commentStore);
  const readMoreComments = async (onComplete: () => void) => {
    try {
      const response = await $client.post.readPosts.query({ cursor: nextCursor.value, parentId: postId });
      pushCommentList(...response.items);
      nextCursor.value = response.nextCursor;
      hasMore.value = response.hasMore;
    } finally {
      onComplete();
    }
  };

  initializeCursorPaginationData(await $client.post.readPosts.query({ parentId: postId }));
  return readMoreComments;
};
