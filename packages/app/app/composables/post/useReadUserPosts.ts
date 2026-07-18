import { PostSortTypeSortByMap } from "@/services/post/PostSortTypeSortByMap";
import { usePostStore } from "@/store/post";

export const useReadUserPosts = (userId: string) => {
  const { $trpc } = useNuxtApp();
  const postStore = usePostStore();
  const { readItems, readMoreItems } = postStore;
  const { sortType } = storeToRefs(postStore);
  const readUserPosts = () =>
    readItems(() => $trpc.post.readPosts.query({ sortBy: PostSortTypeSortByMap[sortType.value], userId }));
  const readMoreUserPosts = (onComplete: () => void) =>
    readMoreItems(
      (cursor) => $trpc.post.readPosts.query({ cursor, sortBy: PostSortTypeSortByMap[sortType.value], userId }),
      onComplete,
    );
  return { readMoreUserPosts, readUserPosts };
};
