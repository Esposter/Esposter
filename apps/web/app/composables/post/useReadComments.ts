import { PostSortTypeSortByMap } from "@/services/post/PostSortTypeSortByMap";
import { AsyncDataKey } from "@/services/shared/AsyncDataKey";
import { useCommentStore } from "@/store/post/comment";

// One branch of the tree — the replies to `parentId`, paged on their own under the thread's chosen sort
export const useReadComments = (parentId: string) => {
  const commentStore = useCommentStore();
  const { commentSortType } = storeToRefs(commentStore);
  const { getSliceOperationData } = commentStore;
  const { hasMore, isLoaded, items, readItems, readMoreItems } = getSliceOperationData(parentId);
  const { readFirstPage, readMorePages } = usePagedPostRead({ readItems, readMoreItems });
  const getQuery = () => ({ parentId, sortBy: PostSortTypeSortByMap[commentSortType.value] });
  const readComments = () => readFirstPage(getQuery(), AsyncDataKey.ReadComments(parentId));
  const readMoreComments = (onComplete: () => void) => readMorePages(getQuery(), onComplete);
  return { hasMore, isLoaded, items, readComments, readMoreComments };
};
