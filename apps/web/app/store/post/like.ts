import { usePostStore } from "@/store/post";

export const useLikeStore = defineStore("post/like", () => {
  const postStore = usePostStore();
  return useLikeOperations(() => postStore.items);
});
