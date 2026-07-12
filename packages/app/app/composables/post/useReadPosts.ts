import { PostSortTypeSortByMap } from "@/services/post/PostSortTypeSortByMap";
import { usePostStore } from "@/store/post";

export const useReadPosts = () => {
  const { $trpc } = useNuxtApp();
  const postStore = usePostStore();
  const { readItems, readMoreItems } = postStore;
  const { sortType } = storeToRefs(postStore);
  const readPosts = () =>
    readItems(() => $trpc.post.readPosts.query({ sortBy: PostSortTypeSortByMap[sortType.value] }));
  const readMorePosts = (onComplete: () => void) =>
    readMoreItems(
      (cursor) => $trpc.post.readPosts.query({ cursor, sortBy: PostSortTypeSortByMap[sortType.value] }),
      onComplete,
    );
  return { readMorePosts, readPosts };
};
