import { AsyncDataKey } from "@/services/shared/AsyncDataKey";
import { useCommentStore } from "@/store/post/comment";

// One branch of the tree — the replies to `parentId`, paged on their own
export const useReadComments = (parentId: string) => {
  const commentStore = useCommentStore();
  const { getSliceOperationData } = commentStore;
  const { hasMore, isLoaded, items, readItems, readMoreItems } = getSliceOperationData(parentId);
  const { readFirstPage, readMorePages } = usePagedPostRead({ readItems, readMoreItems });
  const readComments = () => readFirstPage({ parentId }, AsyncDataKey.ReadComments(parentId));
  const readMoreComments = (onComplete: () => void) => readMorePages({ parentId }, onComplete);
  return { hasMore, isLoaded, items, readComments, readMoreComments };
};
