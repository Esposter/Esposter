import { PostSortTypeSortByMap } from "@/services/post/PostSortTypeSortByMap";
import { AsyncDataKey } from "@/services/shared/AsyncDataKey";
import { usePostStore } from "@/store/post";

export const useReadPosts = (userId?: string) => {
  const postStore = usePostStore();
  const { readItems, readMoreItems } = postStore;
  const { sortType } = storeToRefs(postStore);
  const { readFirstPage, readMorePages } = usePagedPostRead({ readItems, readMoreItems });
  const getQuery = () => ({ sortBy: PostSortTypeSortByMap[sortType.value], userId });
  // The feed and the profile both render server-side, so the first page rides the payload into hydration
  const readPosts = () => readFirstPage(getQuery(), AsyncDataKey.ReadPosts(sortType.value, userId));
  const readMorePosts = (onComplete: () => void) => readMorePages(getQuery(), onComplete);
  return { readMorePosts, readPosts };
};
