import type { PostWithRelations } from "#shared/db/schema/posts";
import type { CreateLikeInput } from "#shared/models/db/post/CreateLikeInput";
import type { DeleteLikeInput } from "#shared/models/db/post/DeleteLikeInput";
import type { UpdateLikeInput } from "#shared/models/db/post/UpdateLikeInput";

export const useLikeOperations = (allPosts: MaybeRefOrGetter<PostWithRelations[]>) => {
  const { $client } = useNuxtApp();
  const { session } = useAuth();

  const createLike = async (input: CreateLikeInput) => {
    const newLike = await $client.like.createLike.mutate(input);
    if (!newLike) return;

    const post = toValue(allPosts).find((p) => p.id === newLike.postId);
    if (!post) return;

    post.likes.push(newLike);
    post.noLikes += newLike.value;
  };
  const updateLike = async (input: UpdateLikeInput) => {
    const updatedLike = await $client.like.updateLike.mutate(input);
    if (!updatedLike) return;

    const post = toValue(allPosts).find((p) => p.id === updatedLike.postId);
    if (!post) return;

    const index = post.likes.findIndex((l) => l.userId === updatedLike.userId && l.postId === updatedLike.postId);
    if (index === -1) return;

    post.likes[index] = { ...post.likes[index], ...updatedLike };
    post.noLikes += updatedLike.value * 2;
  };
  const deleteLike = async (postId: DeleteLikeInput) => {
    const userId = session.value?.user.id;
    if (!userId) return;

    await $client.like.deleteLike.mutate(postId);

    const post = toValue(allPosts).find((p) => p.id === postId);
    if (!post) return;

    const deletedLike = post.likes.find((l) => l.userId === userId && l.postId === postId);
    if (!deletedLike) return;

    post.likes = post.likes.filter((l) => !(l.userId === deletedLike.userId && l.postId === deletedLike.postId));
    post.noLikes -= deletedLike.value;
  };

  return {
    createLike,
    deleteLike,
    updateLike,
  };
};
