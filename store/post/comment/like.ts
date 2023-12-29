import { createCrudLike } from "@/services/post/createCrudLike";
import { useCommentStore } from "@/store/post/comment";

export const useCommentLikeStore = defineStore("post/comment/like", () => {
  const commentStore = useCommentStore();
  const { currentPost, commentList } = storeToRefs(commentStore);
  // We need to track all posts/comments to avoid missing out on updating them on the UI
  const allPosts = computed(() => (currentPost.value ? [currentPost.value, ...commentList.value] : commentList.value));
  return createCrudLike(allPosts);
});
