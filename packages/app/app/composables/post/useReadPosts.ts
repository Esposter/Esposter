import { PostSortTypeSortByMap } from "@/services/post/PostSortTypeSortByMap";
import { AsyncDataKey } from "@/services/shared/AsyncDataKey";
import { usePostStore } from "@/store/post";

export const useReadPosts = (userId?: string) => {
  const { $trpc } = useNuxtApp();
  const postStore = usePostStore();
  const { readItems, readMoreItems } = postStore;
  const { sortType } = storeToRefs(postStore);
  // The feed and the profile both render server-side, so the first page rides the payload into hydration
  const readPosts = () =>
    readItems(() => $trpc.post.readPosts.query({ sortBy: PostSortTypeSortByMap[sortType.value], userId }), {
      key: AsyncDataKey.ReadPosts(sortType.value, userId),
    });
  const readMorePosts = (onComplete: () => void) =>
    readMoreItems(
      (cursor) => $trpc.post.readPosts.query({ cursor, sortBy: PostSortTypeSortByMap[sortType.value], userId }),
      onComplete,
    );
  return { readMorePosts, readPosts };
};
