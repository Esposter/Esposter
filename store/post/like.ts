import { usePostStore } from "@/store/post";

export const useLikeStore = defineStore("post/like", () => {
  const postStore = usePostStore();
  const { postList } = storeToRefs(postStore);
  return useLikeOperations(postList);
});
