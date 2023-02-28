import { usePostStore } from "@/store/post";
import type { Like, Prisma } from "@prisma/client";

export const useLikeStore = defineStore("post/like", () => {
  const postStore = usePostStore();
  const { postList } = storeToRefs(postStore);

  const createLike = (newLike: Like) => {
    const post = postList.value.find((p) => p.id === newLike.postId);
    if (!post) return;

    post.likes.push(newLike);
    post.noLikes += newLike.value;
  };
  const updateLike = (updatedLike: Like) => {
    const post = postList.value.find((p) => p.id === updatedLike.postId);
    if (!post) return;

    const index = post.likes.findIndex((l) => l.userId === updatedLike.userId && l.postId === updatedLike.postId);
    if (index > -1) {
      post.likes[index] = { ...post.likes[index], ...updatedLike };
      post.noLikes += 2 * updatedLike.value;
    }
  };
  const deleteLike = (id: Prisma.LikeUserIdPostIdCompoundUniqueInput) => {
    const post = postList.value.find((p) => p.id === id.postId);
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
