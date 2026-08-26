import { useCommentStore } from "@/store/post/comment";

export const useCommentLikeStore = defineStore("post/comment/like", () => {
  const commentStore = useCommentStore();
  // Read only when a vote is cast, so the tree is walked on a click rather than on every change to it
  return useLikeOperations(() => commentStore.allComments);
});
