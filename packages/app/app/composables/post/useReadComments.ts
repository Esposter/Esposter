import { AsyncDataKey } from "@/services/shared/AsyncDataKey";
import { useCommentStore } from "@/store/post/comment";

// One branch of the tree — the replies to `parentId`, paged on their own
export const useReadComments = (parentId: string) => {
  const { $trpc } = useNuxtApp();
  const commentStore = useCommentStore();
  const { getSliceOperationData } = commentStore;
  const { hasMore, isLoaded, items, readItems, readMoreItems } = getSliceOperationData(parentId);
  const readComments = () =>
    readItems(() => $trpc.post.readPosts.query({ parentId }), { key: AsyncDataKey.ReadComments(parentId) });
  const readMoreComments = (onComplete: () => void) =>
    readMoreItems((cursor) => $trpc.post.readPosts.query({ cursor, parentId }), onComplete);
  return { hasMore, isLoaded, items, readComments, readMoreComments };
};
