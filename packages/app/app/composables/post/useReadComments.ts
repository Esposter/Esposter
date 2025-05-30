import { useCommentStore } from "@/store/post/comment";

export const useReadComments = async (postId: string) => {
  const { $trpc } = useNuxtApp();
  const commentStore = useCommentStore();
  const { initializeCursorPaginationData, pushComments } = commentStore;
  const { hasMore, nextCursor } = storeToRefs(commentStore);
  const readMoreComments = async (onComplete: () => void) => {
    try {
      const response = await $trpc.post.readPosts.query({ cursor: nextCursor.value, parentId: postId });
      nextCursor.value = response.nextCursor;
      hasMore.value = response.hasMore;
      pushComments(...response.items);
    } finally {
      onComplete();
    }
  };

  initializeCursorPaginationData(await $trpc.post.readPosts.query({ parentId: postId }));
  return readMoreComments;
};
