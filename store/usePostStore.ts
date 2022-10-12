import { defineStore } from "pinia";
import type { PostWithRelations } from "@/prisma/types";

export const usePostStore = defineStore("post", () => {
  const postList = ref<PostWithRelations[]>([]);
  const initialisePostList = (posts: PostWithRelations[]) => {
    postList.value = posts;
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
    initialisePostList,
    createPost,
    updatePost,
    deletePost,
  };
});
