import { AsyncDataKey } from "#src/services/shared/AsyncDataKey";
import { useCommentStore } from "#src/store/post/comment/index";

// One branch of the tree — the replies to `parentId`, paged on their own under the thread's chosen sort
export const useReadComments = (parentId: string) => {
  const commentStore = useCommentStore();
  const { commentSortType } = storeToRefs(commentStore);
  const { getBranchItems, getSliceOperationData, readCommentPage } = commentStore;
  const { hasMore, isLoaded, readItems, readMoreItems } = getSliceOperationData(parentId);
  const items = getBranchItems(parentId);
  const { readFirstPage, readMorePages } = usePagedPostRead({ readItems, readMoreItems, readPage: readCommentPage });
  const getQuery = () => ({ parentId, sortName: commentSortType.value });
  const readComments = () => readFirstPage(getQuery(), AsyncDataKey.ReadComments(parentId));
  const readMoreComments = (onComplete: () => void) => readMorePages(getQuery(), onComplete);
  return { hasMore, isLoaded, items, readComments, readMoreComments };
};
