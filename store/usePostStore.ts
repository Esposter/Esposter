import { defineStore } from "pinia";
import { PostWithCreator } from "@/prisma/types";

export const usePostStore = defineStore("post", () => {
  const postList = ref<PostWithCreator[]>([
    {
      title: "Hello!",
      description: "Lorem Ipsum",
      creator: { avatar: "https://cdn.vuetifyjs.com/images/lists/1.jpg" },
      noPoints: 1,
    },
  ]);
  return {
    postList,
  };
});
