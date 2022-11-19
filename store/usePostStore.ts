import type { PostWithRelations } from "@/prisma/types";
import { defineStore } from "pinia";

export const usePostStore = defineStore("post", () => {
  const postList = ref<PostWithRelations[]>([]);
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
    initialisePostList,
    readPost,
    createPost,
    updatePost,
    deletePost,
  };
});
