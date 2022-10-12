import { defineStore } from "pinia";
import type { PostWithCreator } from "@/prisma/types";

export const usePostStore = defineStore("post", () => {
  const postList = ref<PostWithCreator[]>([
    {
      id: "1",
      title: "Hello!",
      description: "Lorem Ipsum",
      creator: { avatar: "https://cdn.vuetifyjs.com/images/lists/1.jpg" },
      noPoints: 1,
    },
  ]);
  const initialisePostList = (posts: PostWithCreator[]) => {
    postList.value = posts;
  };
  const createPost = (newPost: PostWithCreator) => {
    postList.value.push(newPost);
  };
  const updatePost = (updatedPost: PostWithCreator) => {
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
