import { useCommentStore } from "@/store/post/comment";

export const useCommentLikeStore = defineStore("post/comment/like", () => {
  const commentStore = useCommentStore();
  // Every comment on screen, across every open branch — a vote has to reach the row it was cast on wherever the
  // Tree is holding it, and a reply nested ten deep is in none of the lists above it. Read only when a vote is
  // Cast, so the tree is walked on a click rather than on every change to it
  const allPosts = computed(() => {
    const posts = commentStore.currentPost ? [commentStore.currentPost] : [];
    for (const key of commentStore.keys) posts.push(...commentStore.getSlice(key).items.value);
    return posts;
  });
  return useLikeOperations(allPosts);
});
