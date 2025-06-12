import { useCommentStore } from "@/store/post/comment";

export const useReadComments = async (postId: string) => {
  const { $trpc } = useNuxtApp();
  const commentStore = useCommentStore();
  const { initializeCursorPaginationData, pushComments } = commentStore;
  const { hasMore, nextCursor } = storeToRefs(commentStore);
  const readMoreComments = async (onComplete: () => void) => {
    try {
      const {
        hasMore: newHasMore,
        items,
        nextCursor: newNextCursor,
      } = await $trpc.post.readPosts.query({ cursor: nextCursor.value, parentId: postId });
      nextCursor.value = newNextCursor;
      hasMore.value = newHasMore;
      pushComments(...items);
    } finally {
      onComplete();
    }
  };

  initializeCursorPaginationData(await $trpc.post.readPosts.query({ parentId: postId }));
  return readMoreComments;
};
