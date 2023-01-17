import type { PostWithRelations } from "@/prisma/types";

export const usePostStore = defineStore("post", () => {
  const postList = ref<PostWithRelations[]>([]);
  const pushPostList = (posts: PostWithRelations[]) => postList.value.push(...posts);

  const postListNextCursor = ref<string | null>(null);
  const updatePostListNextCursor = (nextCursor: string | null) => {
    postListNextCursor.value = nextCursor;
  };

  const initialisePostList = (posts: PostWithRelations[]) => {
    postList.value = posts;
  };
  const readPost = (id: string) => postList.value.find((p) => p.id === id);
  const createPost = (newPost: PostWithRelations) => {
    postList.value.push(newPost);
  };
  const updatePost = (updatedPost: PostWithRelations) => {
    const index = postList.value.findIndex((r) => r.id === updatedPost.id);
    if (index > -1) postList.value[index] = { ...postList.value[index], ...updatedPost };
  };
  const deletePost = (id: string) => {
    postList.value = postList.value.filter((r) => r.id !== id);
  };

  return {
    postList,
    pushPostList,
    postListNextCursor,
    updatePostListNextCursor,
    initialisePostList,
    readPost,
    createPost,
    updatePost,
    deletePost,
  };
});
