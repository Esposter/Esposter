import { useCommentStore } from "@/store/post/comment";

export const useCommentLikeStore = defineStore("post/comment/like", () => {
  const commentStore = useCommentStore();
  // We need to track all posts/comments to avoid missing out on updating them on the UI
  const allPosts = computed(() =>
    commentStore.currentPost ? [commentStore.currentPost, ...commentStore.commentList] : commentStore.commentList,
  );
  return useLikeOperations(allPosts);
});
