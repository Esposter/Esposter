import { usePostStore } from "@/store/post/usePostStore";

export const useReadPosts = async () => {
  const { $client } = useNuxtApp();
  const postStore = usePostStore();
  const { pushPostList, updatePostListNextCursor, initialisePostList } = postStore;
  const { postListNextCursor } = $(storeToRefs(postStore));
  const readMorePosts = async (onComplete: () => void) => {
    try {
      const { posts, nextCursor } = await $client.post.readPosts.query({ cursor: postListNextCursor });
      pushPostList(posts);
      updatePostListNextCursor(nextCursor);
    } finally {
      onComplete();
    }
  };

  const { posts, nextCursor } = await $client.post.readPosts.query({ cursor: null });
  initialisePostList(posts);
  updatePostListNextCursor(nextCursor);

  return { readMorePosts };
};
