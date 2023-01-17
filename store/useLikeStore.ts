import { usePostStore } from "@/store/usePostStore";
import type { Like, Prisma } from "@prisma/client";

export const useLikeStore = defineStore("like", () => {
  const postStore = usePostStore();
  const createLike = (newLike: Like) => {
    const post = postStore.readPost(newLike.postId);
    if (!post) return;

    post.likes.push(newLike);
    post.noLikes += newLike.value;
  };
  const updateLike = (updatedLike: Like) => {
    const post = postStore.readPost(updatedLike.postId);
    if (!post) return;

    const index = post.likes.findIndex((l) => l.userId === updatedLike.userId && l.postId === updatedLike.postId);
    if (index > -1) {
      post.likes[index] = { ...post.likes[index], ...updatedLike };
      post.noLikes += 2 * updatedLike.value;
    }
  };
  const deleteLike = (id: Prisma.LikeUserIdPostIdCompoundUniqueInput) => {
    const post = postStore.readPost(id.postId);
    if (!post) return;

    const like = post.likes.find((l) => l.userId === id.userId && l.postId === id.postId);
    if (like) {
      post.likes = post.likes.filter((l) => !(l.userId === like.userId && l.postId === like.postId));
      post.noLikes -= like.value;
    }
  };

  return {
    createLike,
    updateLike,
    deleteLike,
  };
});
