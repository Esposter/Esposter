import { useCommentStore } from "@/store/post/comment";

export const useCommentLikeStore = defineStore("post/comment/like", () => {
  const commentStore = useCommentStore();
  return useLikeOperations(() => commentStore.allComments);
});
