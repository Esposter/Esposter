import { useCommentStore } from "@/store/post/comment";

export const useReadComments = async (postId: string) => {
  const { $trpc } = useNuxtApp();
  const commentStore = useCommentStore();
  const { initializeCursorPaginationData, pushCommentList } = commentStore;
  const { hasMore, nextCursor } = storeToRefs(commentStore);
  const readMoreComments = async (onComplete: () => void) => {
    try {
      const response = await $trpc.post.readPosts.query({ cursor: nextCursor.value, parentId: postId });
      nextCursor.value = response.nextCursor;
      hasMore.value = response.hasMore;
      if (response.items.length === 0) return;
      pushCommentList(...response.items);
    } finally {
      onComplete();
    }
  };

  initializeCursorPaginationData(await $trpc.post.readPosts.query({ parentId: postId }));
  return readMoreComments;
};
