import { usePostStore } from "@/store/post";

export const useReadPosts = () => {
  const { $trpc } = useNuxtApp();
  const postStore = usePostStore();
  const { readItems, readMoreItems } = postStore;
  const readPosts = () => readItems(() => $trpc.post.readPosts.useQuery());
  const readMorePosts = (onComplete: () => void) =>
    readMoreItems((cursor) => $trpc.post.readPosts.query({ cursor }), onComplete);
  return { readMorePosts, readPosts };
};
