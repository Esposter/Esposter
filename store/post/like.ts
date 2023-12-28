import { type CreateLikeInput, type DeleteLikeInput, type UpdateLikeInput } from "@/server/trpc/routers/like";
import { usePostStore } from "@/store/post";

export const useLikeStore = defineStore("post/like", () => {
  const { $client } = useNuxtApp();
  const { session } = useAuth();
  const postStore = usePostStore();
  const { postList } = storeToRefs(postStore);

  const createLike = async (input: CreateLikeInput) => {
    const newLike = await $client.like.createLike.mutate(input);
    if (!newLike) return;

    const post = postList.value.find((p) => p.id === newLike.postId);
    if (!post) return;

    post.likes.push(newLike);
    post.noLikes += newLike.value;
  };
  const updateLike = async (input: UpdateLikeInput) => {
    const updatedLike = await $client.like.updateLike.mutate(input);
    if (!updatedLike) return;

    const post = postList.value.find((p) => p.id === updatedLike.postId);
    if (!post) return;

    const index = post.likes.findIndex((l) => l.userId === updatedLike.userId && l.postId === updatedLike.postId);
    if (index > -1) {
      post.likes[index] = { ...post.likes[index], ...updatedLike };
      post.noLikes += 2 * updatedLike.value;
    }
  };
  const deleteLike = async (postId: DeleteLikeInput) => {
    const userId = session.value?.user.id;
    if (!userId) return;

    await $client.like.deleteLike.mutate(postId);

    const post = postList.value.find((p) => p.id === postId);
    if (!post) return;

    const like = post.likes.find((l) => l.userId === userId && l.postId === postId);
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
