import type { PostWithRelations } from "@/db/schema/posts";
import { createPaginationData } from "@/services/shared/pagination/createPaginationData";

export const usePostStore = defineStore("post", () => {
  const { items: postList, ...rest } = createPaginationData<PostWithRelations>();
  const pushPosts = (posts: PostWithRelations[]) => {
    postList.value.push(...posts);
  };
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
    ...rest,
    pushPosts,
    createPost,
    updatePost,
    deletePost,
  };
});
